const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

// Get bill details for a patient
router.get('/patient-bill/:patientId', async (req, res) => {
    try {
        await billController.getBillDetails(req, res);
    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Generate and save bill
router.post('/generate-bill', async (req, res) => {
    try {
        await billController.generateBill(req, res);
    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 