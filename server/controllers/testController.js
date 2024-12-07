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

  // Add a test for a patient
  addPatientTest: async (req, res) => {
    let connection;
    try {
      const { patientId, testId } = req.body;
      connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `INSERT INTO Had_Test (pid, tid, testdate) 
         VALUES (:pid, :tid, SYSDATE)`,
        { pid: patientId, tid: testId },
        { autoCommit: true }
      );

      res.json({ message: 'Test added successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error adding test' });
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