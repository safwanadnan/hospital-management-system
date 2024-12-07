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
      connection = await oracledb.getConnection();
      
      // Start a transaction
      await connection.execute('BEGIN');
      
      for (const medicine of medicines) {
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
      
      // Commit the transaction
      await connection.execute('COMMIT');
      
      res.json({ message: 'Medicines added successfully' });
    } catch (err) {
      if (connection) {
        try {
          // Rollback in case of error
          await connection.execute('ROLLBACK');
        } catch (rollbackErr) {
          console.error('Error rolling back:', rollbackErr);
        }
      }
      console.error(err);
      res.status(500).json({ error: 'Error adding medicines' });
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
  }
};

module.exports = medicineController; 