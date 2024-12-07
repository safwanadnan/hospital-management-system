const oracledb = require('oracledb');

const medicineController = {
  // Get all available medicines
  getAllMedicines: async (req, res) => {
    let connection;
    try {
      console.log('Attempting to get database connection...');
      connection = await oracledb.getConnection();
      console.log('Connected to database');
      
      // Modified query with explicit aliasing and uppercase column names
      const result = await connection.execute(
        `SELECT 
          MID as "MID",
          MNAME as "MNAME",
          MCOST as "MCOST"
        FROM MEDICINE`,
        [],
        { 
          outFormat: oracledb.OUT_FORMAT_OBJECT,
          fetchInfo: {
            "MNAME": { type: oracledb.STRING }
          }
        }
      );
      
      console.log('Raw query result:', result);
      console.log('Query rows:', result.rows);
      console.log('First row sample:', result.rows[0]);

      if (!result.rows || result.rows.length === 0) {
        console.log('No medicines found in database');
        return res.json([]);
      }

      res.json(result.rows);
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ 
        error: 'Error fetching medicines', 
        details: err.message,
        stack: err.stack 
      });
    } finally {
      if (connection) {
        try {
          await connection.close();
          console.log('Database connection closed');
        } catch (err) {
          console.error('Error closing connection:', err);
        }
      }
    }
  },

  // Add medicines to patient's prescription
addPatientMedicine: async (req, res) => {
  let connection;
  try {
    const { patientId, medicines, date } = req.body;
    
    if (!patientId || !medicines || !date || !medicines.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    connection = await oracledb.getConnection();
    
    // Verify patient exists
    const patientExists = await connection.execute(
      'SELECT 1 FROM patient WHERE pid = :pid',
      { pid: patientId }
    );

    if (patientExists.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    for (const medicine of medicines) {
      // Verify medicine exists
      const medicineExists = await connection.execute(
        'SELECT 1 FROM medicine WHERE mid = :mid',
        { mid: medicine.mid }
      );

      if (medicineExists.rows.length === 0) {
        return res.status(404).json({ error: `Medicine with ID ${medicine.mid} not found` });
      }

      // Check if record already exists for this patient, medicine and date
      const existingRecord = await connection.execute(
        `SELECT qty 
         FROM Had_Medicine 
         WHERE pid = :pid 
         AND mid = :mid 
         AND med_date = TO_DATE(:med_date, 'YYYY-MM-DD')`,
        {
          pid: parseInt(patientId),
          mid: medicine.mid,
          med_date: date
        }
      );

      if (existingRecord.rows.length > 0) {
        // Update existing record by adding the new quantity
        await connection.execute(
          `UPDATE Had_Medicine 
           SET qty = qty + :new_qty 
           WHERE pid = :pid 
           AND mid = :mid 
           AND med_date = TO_DATE(:med_date, 'YYYY-MM-DD')`,
          {
            new_qty: medicine.quantity,
            pid: parseInt(patientId),
            mid: medicine.mid,
            med_date: date
          }
        );
      } else {
        // Insert new record
        await connection.execute(
          `INSERT INTO Had_Medicine (pid, mid, med_date, qty) 
           VALUES (:pid, :mid, TO_DATE(:med_date, 'YYYY-MM-DD'), :qty)`,
          {
            pid: parseInt(patientId),
            mid: medicine.mid,
            med_date: date,
            qty: medicine.quantity
          }
        );
      }
    }
    
    // Commit the transaction
    await connection.execute('COMMIT');
    
    res.json({ 
      success: true,
      message: 'Medicines updated successfully',
      data: { patientId, medicines, date }
    });
  } catch (err) {
    if (connection) {
      try {
        await connection.execute('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back:', rollbackErr);
      }
    }
    console.error('Error in addPatientMedicine:', err);
    res.status(500).json({ 
      error: 'Error adding medicines',
      details: err.message 
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
},

  // Get patient's medicine history
  getPatientMedicines: async (req, res) => {
    let connection;
    try {
      const { patientId } = req.params;
      connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `SELECT m.mname, hm.qty, hm.med_date 
         FROM Had_Medicine hm 
         JOIN Medicine m ON hm.mid = m.mid 
         WHERE hm.pid = :pid 
         ORDER BY hm.med_date DESC`,
        { pid: parseInt(patientId) },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching patient medicines' });
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

  // Add this new method to the medicineController object
  getAllMedicineRecords: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `SELECT 
          hm.pid as "PID",
          m.mname as "MNAME",
          hm.qty as "QTY",
          TO_CHAR(hm.med_date, 'YYYY-MM-DD') as "MED_DATE"
         FROM Had_Medicine hm 
         JOIN Medicine m ON hm.mid = m.mid 
         ORDER BY hm.med_date DESC`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error in getAllMedicineRecords:', err);
      res.status(500).json({ error: 'Error fetching medicine records' });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error closing connection:', err);
        }
      }
    }
  }
};

module.exports = medicineController; 