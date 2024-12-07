const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

router.get('/patient-bill/:patientId', billController.getPatientBillDetails);
router.post('/generate-bill', billController.saveBill);

module.exports = router; 