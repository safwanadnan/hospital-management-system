const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const patientRoutes = require('./routes/patients');
const adminRoutes = require('./routes/admin');
const billsRoutes = require('./routes/bills');
const medicineRoutes = require('./routes/medicines');
const testRoutes = require('./routes/tests');   

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database initialization
async function initialize() {
  try {
    await oracledb.createPool({
      user: "HOSPITAL",
      password: "hospital",
      connectString: "localhost:1521/FREEPDB1"
    });
    console.log('Connected to database');
  } catch (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
}

initialize();

// Routes
app.use('/api', patientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/tests', testRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Cleanup function
async function closePoolAndExit() {
  console.log('\nTerminating');
  try {
    await oracledb.getPool().close(10);
    console.log('Pool closed');
    process.exit(0);
  } catch(err) {
    console.error(err.message);
    process.exit(1);
  }
}

process
  .once('SIGTERM', closePoolAndExit)
  .once('SIGINT',  closePoolAndExit);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 