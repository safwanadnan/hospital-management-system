// server/index.js

const express = require('express');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 5000;

// Load environment variables
dotenv.config();

// Middleware to parse JSON
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Welcome to Hospital Management System API!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
