const oracledb = require('oracledb');

const testController = {
  // Get all available tests
  getAllTests: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        'SELECT tid, tname, tcost FROM Test',
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching tests' });
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

  // Get all test records
  getAllTestRecords: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `SELECT 
          ht.pid as "PID",
          t.tname as "TNAME",
          t.tcost as "TCOST",
          TO_CHAR(ht.testdate, 'YYYY-MM-DD') as "TEST_DATE"
         FROM Had_Test ht 
         JOIN Test t ON ht.tid = t.tid 
         ORDER BY ht.testdate DESC`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error in getAllTestRecords:', err);
      res.status(500).json({ error: 'Error fetching test records' });
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

  // Update addPatientTest method
  addPatientTest: async (req, res) => {
    let connection;
    try {
      const { patientId, testId, date } = req.body;
      
      if (!patientId || !testId || !date) {
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

      // Verify test exists
      const testExists = await connection.execute(
        'SELECT 1 FROM test WHERE tid = :tid',
        { tid: testId }
      );

      if (testExists.rows.length === 0) {
        return res.status(404).json({ error: 'Test not found' });
      }

      // Check if test already exists for this patient and date
      const existingTest = await connection.execute(
        `SELECT 1 
         FROM Had_Test 
         WHERE pid = :pid 
         AND tid = :tid 
         AND testdate = TO_DATE(:test_date, 'YYYY-MM-DD')`,
        {
          pid: patientId,
          tid: testId,
          test_date: date
        }
      );

      if (existingTest.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Test already recorded for this patient on this date' 
        });
      }

      // Insert new test record
      await connection.execute(
        `INSERT INTO Had_Test (pid, tid, testdate) 
         VALUES (:pid, :tid, TO_DATE(:test_date, 'YYYY-MM-DD'))`,
        {
          pid: patientId,
          tid: testId,
          test_date: date
        }
      );

      // Commit the transaction
      await connection.execute('COMMIT');
      
      res.json({ 
        success: true,
        message: 'Test added successfully',
        data: { patientId, testId, date }
      });
    } catch (err) {
      if (connection) {
        try {
          await connection.execute('ROLLBACK');
        } catch (rollbackErr) {
          console.error('Error rolling back:', rollbackErr);
        }
      }
      console.error('Error in addPatientTest:', err);
      res.status(500).json({ 
        error: 'Error adding test',
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

  // Get patient's tests
  getPatientTests: async (req, res) => {
    let connection;
    try {
      const { patientId } = req.params;
      connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `SELECT t.tname, ht.testdate 
         FROM Had_Test ht 
         JOIN Test t ON ht.tid = t.tid 
         WHERE ht.pid = :pid 
         ORDER BY ht.testdate DESC`,
        { pid: patientId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching patient tests' });
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

module.exports = testController; 