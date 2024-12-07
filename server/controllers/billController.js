const oracledb = require('oracledb');

const billController = {
  // Get patient details and their medical history
  getPatientBillDetails: async (req, res) => {
    let connection;
    try {
      const { patientId } = req.params;
      connection = await oracledb.getConnection();

      // Get patient details
      const patientQuery = `
        SELECT 
          p.pid,
          p.fname || ' ' || NVL(p.lname, '') as full_name,
          p.gender,
          p.hno || ' ' || p.street || ', ' || p.city || ', ' || p.state as address,
          COALESCE(ip.disease, op.disease) as disease
        FROM patient p
        LEFT JOIN in_patient ip ON p.pid = ip.pid 
          AND ip.discharge_date IS NULL
        LEFT JOIN out_patient op ON p.pid = op.pid 
          AND op.arrival_date = (
            SELECT MAX(arrival_date) 
            FROM out_patient 
            WHERE pid = p.pid
          )
        WHERE p.pid = :pid`;

      const patientResult = await connection.execute(
        patientQuery,
        { pid: patientId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (patientResult.rows.length === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Get medicines given
      const medicineQuery = `
        SELECT 
          m.mname,
          hm.qty,
          m.mcost as unit_cost,
          (hm.qty * m.mcost) as total_cost
        FROM had_medicine hm
        JOIN medicine m ON hm.mid = m.mid
        WHERE hm.pid = :pid
        AND hm.med_date >= TRUNC(SYSDATE)`;

      const medicineResult = await connection.execute(
        medicineQuery,
        { pid: patientId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      // Get tests performed
      const testQuery = `
        SELECT 
          t.tname,
          t.tcost as cost
        FROM had_test ht
        JOIN test t ON ht.tid = t.tid
        WHERE ht.pid = :pid
        AND ht.testdate >= TRUNC(SYSDATE)`;

      const testResult = await connection.execute(
        testQuery,
        { pid: patientId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      // Get room charges if patient is admitted
      const roomQuery = `
        SELECT 
          r.roomtype,
          rc.rcost,
          CEIL(NVL(SYSDATE - ip.arrival_date, 0)) as days
        FROM in_patient ip
        JOIN room r ON ip.rid = r.rid
        JOIN room_cost rc ON r.roomtype = rc.roomtype
        WHERE ip.pid = :pid
        AND ip.discharge_date IS NULL`;

      const roomResult = await connection.execute(
        roomQuery,
        { pid: patientId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const response = {
        patientDetails: {
          name: patientResult.rows[0].FULL_NAME,
          gender: patientResult.rows[0].GENDER,
          address: patientResult.rows[0].ADDRESS,
          diseaseTreated: patientResult.rows[0].DISEASE
        },
        medicines: medicineResult.rows.map(med => ({
          name: med.MNAME,
          quantity: med.QTY,
          cost: med.UNIT_COST,
          totalCost: med.TOTAL_COST
        })),
        tests: testResult.rows.map(test => ({
          name: test.TNAME,
          cost: test.COST
        })),
        roomCharges: roomResult.rows.length > 0 ? 
          roomResult.rows[0].RCOST * roomResult.rows[0].DAYS : 0
      };

      res.json(response);
    } catch (err) {
      console.error('Error in getPatientBillDetails:', err);
      res.status(500).json({ error: 'Error fetching patient details' });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  },

  // Save generated bill
  saveBill: async (req, res) => {
    let connection;
    try {
      const { patientId, medicineCost, testCost, roomCharges, otherCharges } = req.body;
      
      connection = await oracledb.getConnection();
      
      await connection.execute(
        `INSERT INTO Bill (pid, mcost, tcost, roomcharges, othercharges, billdate)
         VALUES (:pid, :mcost, :tcost, :roomcharges, :othercharges, SYSDATE)`,
        {
          pid: patientId,
          mcost: medicineCost,
          tcost: testCost,
          roomcharges: roomCharges,
          othercharges: otherCharges
        }
      );

      await connection.execute('COMMIT');
      res.json({ message: 'Bill generated successfully' });
    } catch (err) {
      console.error('Error in saveBill:', err);
      res.status(500).json({ error: 'Error generating bill' });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
};

module.exports = billController; 