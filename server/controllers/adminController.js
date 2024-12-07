const oracledb = require('oracledb');

const adminController = {
  // Login
  login: async (req, res) => {
    let connection;
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT username FROM admin_users 
         WHERE LOWER(username) = LOWER(:username) AND password = :password`,
        { username, password },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows && result.rows.length > 0) {
        res.json({ 
          success: true, 
          username: result.rows[0].USERNAME || result.rows[0].username 
        });
      } else {
        res.status(401).json({ error: 'Invalid username or password' });
      }
    } catch (err) {
      console.error('Error in login:', err);
      res.status(500).json({ error: 'Database error occurred' });
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

  // Doctors
  getDoctors: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT e.EMPID, e.FNAME, e.MNAME, e.LNAME, e.GENDER, 
                e.DEPTID, e.EMAIL, e.DATE_OF_BIRTH, e.STREET, 
                e.CITY, e.STATE, e.HNO
         FROM Employee e 
         WHERE e.EMPTYPE = 'DOCTOR'
         ORDER BY e.EMPID`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      console.log('Doctors from DB:', result.rows); // Debug log
      res.json(result.rows);
    } catch (err) {
      console.error('Error in getDoctors:', err);
      res.status(500).json({ error: 'Error fetching doctors' });
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

  addDoctor: async (req, res) => {
    let connection;
    try {
      const { empid, fname, mname, lname, gender, deptid, email,
              date_of_birth, street, city, state, Hno } = req.body;
      
      connection = await oracledb.getConnection();
      await connection.execute(
        `INSERT INTO Employee (empid, fname, mname, lname, gender, emptype, 
          deptid, email, date_of_birth, street, city, state, Hno, date_of_joining, since)
         VALUES (:1, :2, :3, :4, :5, 'DOCTOR', :6, :7, :8, :9, :10, :11, :12, CURRENT_DATE, CURRENT_DATE)`,
        [empid, fname, mname, lname, gender, deptid, email,
         date_of_birth, street, city, state, Hno],
        { autoCommit: true }
      );
      res.json({ message: 'Doctor added successfully' });
    } catch (err) {
      console.error('Error in addDoctor:', err);
      res.status(500).json({ error: 'Error adding doctor' });
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

  updateDoctor: async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { fname, mname, lname, gender, deptid, email,
              date_of_birth, street, city, state, Hno } = req.body;
      
      connection = await oracledb.getConnection();
      await connection.execute(
        `UPDATE Employee 
         SET fname = :1, mname = :2, lname = :3, gender = :4,
             deptid = :5, email = :6, 
             date_of_birth = TO_DATE(:7, 'YYYY-MM-DD'),
             street = :8, city = :9, state = :10, Hno = :11
         WHERE empid = :12 AND emptype = 'DOCTOR'`,
        [fname, mname, lname, gender, deptid, email,
         date_of_birth, street, city, state, Hno, id],
        { autoCommit: true }
      );
      res.json({ message: 'Doctor updated successfully' });
    } catch (err) {
      console.error('Error in updateDoctor:', err);
      res.status(500).json({ error: 'Error updating doctor' });
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

  deleteDoctor: async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await oracledb.getConnection();
      
      await connection.execute(
        'DELETE FROM Employee WHERE empid = :1 AND emptype = :2',
        [id, 'DOCTOR'],
        { autoCommit: true }
      );
      
      res.json({ message: 'Doctor deleted successfully' });
    } catch (err) {
      console.error('Error in deleteDoctor:', err);
      res.status(500).json({ error: 'Error deleting doctor' });
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

  // Nurses
  getNurses: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT e.EMPID, e.FNAME, e.MNAME, e.LNAME, e.GENDER, 
                e.DEPTID, e.EMAIL, e.DATE_OF_BIRTH, e.STREET, 
                e.CITY, e.STATE, e.HNO, na.COUNTPATIENT
         FROM Employee e 
         LEFT JOIN Nurse_Assigned na ON e.EMPID = na.NID
         WHERE e.EMPTYPE = 'NURSE'
         ORDER BY e.EMPID`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      console.log('Nurses from DB:', result.rows); // Debug log
      res.json(result.rows);
    } catch (err) {
      console.error('Error in getNurses:', err);
      res.status(500).json({ error: 'Error fetching nurses' });
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

  addNurse: async (req, res) => {
    let connection;
    try {
      const { empid, fname, mname, lname, gender, deptid, email,
              date_of_birth, street, city, state, Hno } = req.body;
      
      connection = await oracledb.getConnection();
      await connection.execute('BEGIN');
      
      await connection.execute(
        `INSERT INTO Employee (empid, fname, mname, lname, gender, emptype, 
          deptid, email, date_of_birth, street, city, state, Hno, date_of_joining, since)
         VALUES (:1, :2, :3, :4, :5, 'NURSE', :6, :7, :8, :9, :10, :11, :12, CURRENT_DATE, CURRENT_DATE)`,
        [empid, fname, mname, lname, gender, deptid, email,
         date_of_birth, street, city, state, Hno]
      );

      await connection.execute(
        `INSERT INTO Nurse_Assigned (nid, countpatient)
         VALUES (:1, 0)`,
        [empid]
      );

      await connection.execute('COMMIT');
      res.json({ message: 'Nurse added successfully' });
    } catch (err) {
      if (connection) {
        try {
          await connection.execute('ROLLBACK');
        } catch (rollbackErr) {
          console.error('Error rolling back:', rollbackErr);
        }
      }
      console.error('Error in addNurse:', err);
      res.status(500).json({ error: 'Error adding nurse' });
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

  updateNurse: async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { fname, mname, lname, gender, deptid, email,
              date_of_birth, street, city, state, Hno } = req.body;
      
      connection = await oracledb.getConnection();
      await connection.execute(
        `UPDATE Employee 
         SET fname = :1, mname = :2, lname = :3, gender = :4,
             deptid = :5, email = :6, 
             date_of_birth = TO_DATE(:7, 'YYYY-MM-DD'),
             street = :8, city = :9, state = :10, Hno = :11
         WHERE empid = :12 AND emptype = 'NURSE'`,
        [fname, mname, lname, gender, deptid, email,
         date_of_birth, street, city, state, Hno, id],
        { autoCommit: true }
      );
      res.json({ message: 'Nurse updated successfully' });
    } catch (err) {
      console.error('Error in updateNurse:', err);
      res.status(500).json({ error: 'Error updating nurse' });
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

  deleteNurse: async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await oracledb.getConnection();
      
      await connection.execute(
        'DELETE FROM Employee WHERE empid = :1 AND emptype = :2',
        [id, 'NURSE'],
        { autoCommit: true }
      );
      
      res.json({ message: 'Nurse deleted successfully' });
    } catch (err) {
      console.error('Error in deleteNurse:', err);
      res.status(500).json({ error: 'Error deleting nurse' });
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

  // Departments
  getDepartments: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT deptid, dname, dept_headid 
         FROM Department 
         ORDER BY deptid`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error in getDepartments:', err);
      res.status(500).json({ error: 'Error fetching departments' });
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

  addDepartment: async (req, res) => {
    let connection;
    try {
      const { deptid, dname, dept_headid } = req.body;
      
      connection = await oracledb.getConnection();
      await connection.execute(
        `INSERT INTO Department (deptid, dname, dept_headid)
         VALUES (:1, :2, :3)`,
        [deptid, dname, dept_headid],
        { autoCommit: true }
      );
      res.json({ message: 'Department added successfully' });
    } catch (err) {
      console.error('Error in addDepartment:', err);
      res.status(500).json({ error: 'Error adding department' });
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

  updateDepartment: async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { dname, dept_headid } = req.body;
      
      connection = await oracledb.getConnection();
      await connection.execute(
        `UPDATE Department 
         SET dname = :1, dept_headid = :2
         WHERE deptid = :3`,
        [dname, dept_headid, id],
        { autoCommit: true }
      );
      res.json({ message: 'Department updated successfully' });
    } catch (err) {
      console.error('Error in updateDepartment:', err);
      res.status(500).json({ error: 'Error updating department' });
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

  deleteDepartment: async (req, res) => {
    let connection;
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid department ID' });
      }

      connection = await oracledb.getConnection();
      await connection.execute(
        'DELETE FROM Department WHERE deptid = :1',
        [id],
        { autoCommit: true }
      );
      res.json({ message: 'Department deleted successfully' });
    } catch (err) {
      console.error('Error in deleteDepartment:', err);
      res.status(500).json({ error: 'Error deleting department' });
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

  // Rooms
  getRooms: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT r.RID, r.ROOMTYPE, rc.RCOST 
         FROM Room r 
         LEFT JOIN Room_Cost rc ON r.ROOMTYPE = rc.ROOMTYPE 
         ORDER BY r.RID`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error in getRooms:', err);
      res.status(500).json({ error: 'Error fetching rooms' });
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

  getRoomCosts: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        'SELECT * FROM Room_Cost',
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error in getRoomCosts:', err);
      res.status(500).json({ error: 'Error fetching room costs' });
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

  addRoom: async (req, res) => {
    let connection;
    try {
      const { rid, roomtype } = req.body;
      
      connection = await oracledb.getConnection();
      await connection.execute(
        `INSERT INTO Room (rid, roomtype)
         VALUES (:1, :2)`,
        [rid, roomtype],
        { autoCommit: true }
      );
      res.json({ message: 'Room added successfully' });
    } catch (err) {
      console.error('Error in addRoom:', err);
      res.status(500).json({ error: 'Error adding room' });
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

  addRoomCost: async (req, res) => {
    let connection;
    try {
      const { roomtype, rcost } = req.body;
      
      connection = await oracledb.getConnection();
      await connection.execute(
        `INSERT INTO Room_Cost (roomtype, rcost)
         VALUES (:1, :2)`,
        [roomtype, rcost],
        { autoCommit: true }
      );
      res.json({ message: 'Room cost added successfully' });
    } catch (err) {
      console.error('Error in addRoomCost:', err);
      res.status(500).json({ error: 'Error adding room cost' });
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

  updateRoom: async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { roomtype } = req.body;
      
      connection = await oracledb.getConnection();
      await connection.execute(
        `UPDATE Room 
         SET roomtype = :1
         WHERE rid = :2`,
        [roomtype, id],
        { autoCommit: true }
      );
      res.json({ message: 'Room updated successfully' });
    } catch (err) {
      console.error('Error in updateRoom:', err);
      res.status(500).json({ error: 'Error updating room' });
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

  updateRoomCost: async (req, res) => {
    let connection;
    try {
      const { type } = req.params;
      const { rcost } = req.body;
      
      connection = await oracledb.getConnection();
      await connection.execute(
        `UPDATE Room_Cost 
         SET rcost = :1
         WHERE roomtype = :2`,
        [rcost, type],
        { autoCommit: true }
      );
      res.json({ message: 'Room cost updated successfully' });
    } catch (err) {
      console.error('Error in updateRoomCost:', err);
      res.status(500).json({ error: 'Error updating room cost' });
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

  deleteRoom: async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await oracledb.getConnection();
      await connection.execute(
        'DELETE FROM Room WHERE rid = :1',
        [id],
        { autoCommit: true }
      );
      res.json({ message: 'Room deleted successfully' });
    } catch (err) {
      console.error('Error in deleteRoom:', err);
      res.status(500).json({ error: 'Error deleting room' });
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

  deleteRoomCost: async (req, res) => {
    let connection;
    try {
      const { type } = req.params;
      connection = await oracledb.getConnection();
      await connection.execute(
        'DELETE FROM Room_Cost WHERE roomtype = :1',
        [type],
        { autoCommit: true }
      );
      res.json({ message: 'Room cost deleted successfully' });
    } catch (err) {
      console.error('Error in deleteRoomCost:', err);
      res.status(500).json({ error: 'Error deleting room cost' });
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

module.exports = adminController;