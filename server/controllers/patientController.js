const oracledb = require('oracledb');

const patientController = {
  // Search patients by name or ID
  searchPatients: async (req, res) => {
    let connection;
    try {
      const { searchType, searchQuery } = req.query;
      connection = await oracledb.getConnection();
      
      let query = `
        SELECT 
          p.pid as "patientId",
          p.fname || ' ' || NVL(p.lname, '') as "patientName",
          p.gender as "gender",
          p.hno || ' ' || p.street || ', ' || p.city || ', ' || p.state as "address",
          e.fname || ' ' || NVL(e.lname, '') as "doctorAssigned",
          CASE 
            WHEN ip.rid IS NOT NULL THEN 'Room ' || ip.rid
            ELSE 'Not Admitted'
          END as "roomAdmitted",
          TO_CHAR(ip.arrival_date, 'YYYY-MM-DD') as "dateAdmitted",
          TO_CHAR(ip.discharge_date, 'YYYY-MM-DD') as "dateDischarged"
        FROM patient p
        LEFT JOIN employee e ON p.doc_id = e.empid
        LEFT JOIN in_patient ip ON p.pid = ip.pid
        WHERE `;

      let bindParams = {};
      
      if (searchType === 'name') {
        query += `LOWER(p.fname || ' ' || NVL(p.lname, '')) LIKE LOWER(:searchTerm)`;
        bindParams.searchTerm = `%${searchQuery}%`;
      } else {
        query += `p.pid = :searchTerm`;
        bindParams.searchTerm = searchQuery;
      }

      query += ` ORDER BY p.pid`;

      const result = await connection.execute(
        query,
        bindParams,
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error in searchPatients:', err);
      res.status(500).json({ error: 'Error searching patients' });
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

  // Get patient details by ID
  getPatientDetails: async (req, res) => {
    let connection;
    try {
      const { patientId } = req.params;
      connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `SELECT 
          p.*,
          e.fname || ' ' || NVL(e.lname, '') as doctor_name,
          d.dname as department
        FROM patient p
        LEFT JOIN employee e ON p.doc_id = e.empid
        LEFT JOIN department d ON e.deptid = d.deptid
        WHERE p.pid = :pid`,
        { pid: patientId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Patient not found' });
        return;
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error in getPatientDetails:', err);
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

  // Get patient details for update
  getPatientForUpdate: async (req, res) => {
    let connection;
    try {
      const { patientId } = req.params;
      
      if (!patientId || isNaN(patientId)) {
        return res.status(400).json({ error: 'Invalid patient ID' });
      }

      connection = await oracledb.getConnection();
      
      // Get patient basic info
      const patientResult = await connection.execute(
        `SELECT 
          p.pid, p.fname, p.lname, p.gender, 
          TO_CHAR(p.dob, 'YYYY-MM-DD') as dob,
          p.blood_group, p.hno, p.street, p.city, p.state, p.email
        FROM patient p
        WHERE p.pid = :pid`,
        { pid: patientId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (patientResult.rows.length === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Get patient phone numbers
      const phoneResult = await connection.execute(
        `SELECT phoneno FROM pt_phone WHERE pid = :pid`,
        { pid: patientId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      // Get relative info
      const relativeResult = await connection.execute(
        `SELECT rname, rtype, pno FROM relative WHERE pid = :pid`,
        { pid: patientId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const patientData = {
        ...patientResult.rows[0],
        phones: phoneResult.rows.map(p => p.PHONENO),
        relative: relativeResult.rows[0] || {}
      };

      res.json(patientData);
    } catch (err) {
      console.error('Error in getPatientForUpdate:', err);
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

  // Update patient record
  updatePatient: async (req, res) => {
    let connection;
    try {
      const { patientId } = req.params;
      const {
        firstName, lastName, gender, dateOfBirth, bloodGroup,
        houseNo, street, city, state, email,
        mobileNo1, mobileNo2,
        relativeName, relation, relativePhone
      } = req.body;

      connection = await oracledb.getConnection();
      
      // Start transaction
      await connection.execute(`
        BEGIN
          -- Update patient basic info
          UPDATE patient 
          SET fname = :fname,
              lname = :lname,
              gender = :gender,
              dob = TO_DATE(:dob, 'YYYY-MM-DD'),
              blood_group = :blood_group,
              hno = :hno,
              street = :street,
              city = :city,
              state = :state,
              email = :email
          WHERE pid = :pid;

          -- Delete existing phone numbers
          DELETE FROM pt_phone WHERE pid = :pid;

          -- Insert new phone numbers
          IF :phone1 IS NOT NULL THEN
            INSERT INTO pt_phone (pid, phoneno) VALUES (:pid, :phone1);
          END IF;
          
          IF :phone2 IS NOT NULL THEN
            INSERT INTO pt_phone (pid, phoneno) VALUES (:pid, :phone2);
          END IF;

          -- Update or insert relative info
          MERGE INTO relative r
          USING dual
          ON (r.pid = :pid)
          WHEN MATCHED THEN
            UPDATE SET rname = :rname, rtype = :rtype, pno = :pno
          WHEN NOT MATCHED THEN
            INSERT (pid, rname, rtype, pno)
            VALUES (:pid, :rname, :rtype, :pno);

          COMMIT;
        END;`,
        {
          fname: firstName,
          lname: lastName || null,
          gender,
          dob: dateOfBirth,
          blood_group: bloodGroup || null,
          hno: houseNo || null,
          street: street || null,
          city: city || null,
          state: state || null,
          email: email || null,
          pid: patientId,
          phone1: mobileNo1 || null,
          phone2: mobileNo2 || null,
          rname: relativeName || null,
          rtype: relation || null,
          pno: relativePhone || null
        }
      );

      res.json({ message: 'Patient record updated successfully' });
    } catch (err) {
      console.error('Error in updatePatient:', err);
      res.status(500).json({ error: 'Error updating patient record' });
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

  registerPatient: async (req, res) => {
    let connection;
    try {
      const {
        patientId,
        firstName,
        lastName,
        gender,
        dateOfBirth,
        bloodGroup,
        doctorId,
        houseNo,
        street,
        city,
        state,
        email,
        phoneNumbers,
        relativeName,
        relation,
        relativePhone,
        isInPatient,
        disease,
        roomId,
        nurseId
      } = req.body;

      connection = await oracledb.getConnection();
      
      // Start transaction
      await connection.execute('BEGIN');

      // Insert patient basic info
      await connection.execute(
        `INSERT INTO patient (
          pid, fname, lname, gender, dob, blood_group, 
          doc_id, hno, street, city, state, email
        ) VALUES (
          :pid, :fname, :lname, :gender, TO_DATE(:dob, 'YYYY-MM-DD'), 
          :blood_group, :doc_id, :hno, :street, :city, :state, :email
        )`,
        {
          pid: patientId,
          fname: firstName,
          lname: lastName || null,
          gender,
          dob: dateOfBirth,
          blood_group: bloodGroup || null,
          doc_id: doctorId || null,
          hno: houseNo || null,
          street: street || null,
          city: city || null,
          state: state || null,
          email: email || null
        }
      );

      // Insert phone numbers
      if (phoneNumbers && phoneNumbers.length > 0) {
        for (const phone of phoneNumbers) {
          if (phone) {
            await connection.execute(
              'INSERT INTO pt_phone (pid, phoneno) VALUES (:pid, :phone)',
              { pid: patientId, phone }
            );
          }
        }
      }

      // Insert relative info
      if (relativeName && relation && relativePhone) {
        await connection.execute(
          `INSERT INTO relative (pid, rname, rtype, pno)
           VALUES (:pid, :rname, :rtype, :pno)`,
          {
            pid: patientId,
            rname: relativeName,
            rtype: relation,
            pno: relativePhone
          }
        );
      }

      // Insert patient type specific info
      const currentDate = new Date().toISOString().split('T')[0];
      
      if (isInPatient) {
        await connection.execute(
          `INSERT INTO in_patient (pid, nid, rid, arrival_date, disease)
           VALUES (:pid, :nid, :rid, TO_DATE(:arrival_date, 'YYYY-MM-DD'), :disease)`,
          {
            pid: patientId,
            nid: nurseId,
            rid: roomId,
            arrival_date: currentDate,
            disease: disease
          }
        );

        // Update nurse's patient count
        await connection.execute(
          `UPDATE nurse_assigned 
           SET countpatient = countpatient + 1 
           WHERE nid = :nid`,
          { nid: nurseId }
        );
      } else {
        await connection.execute(
          `INSERT INTO out_patient (pid, arrival_date, disease)
           VALUES (:pid, TO_DATE(:arrival_date, 'YYYY-MM-DD'), :disease)`,
          {
            pid: patientId,
            arrival_date: currentDate,
            disease: disease
          }
        );
      }

      // Commit transaction
      await connection.execute('COMMIT');

      res.json({ 
        message: 'Patient registered successfully',
        patientId: patientId
      });
    } catch (err) {
      if (connection) {
        try {
          await connection.execute('ROLLBACK');
        } catch (rollbackErr) {
          console.error('Error rolling back:', rollbackErr);
        }
      }
      console.error('Error in registerPatient:', err);
      res.status(500).json({ error: 'Error registering patient' });
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

  // Add method to get next available patient ID
  getNextPatientId: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `SELECT NVL(MAX(pid), 1000) + 1 as next_id FROM patient`
      );

      res.json({ nextId: result.rows[0][0] });
    } catch (err) {
      console.error('Error in getNextPatientId:', err);
      res.status(500).json({ error: 'Error getting next patient ID' });
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

module.exports = patientController; 