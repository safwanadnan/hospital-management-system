const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

// Get all medicines
router.get('/', medicineController.getAllMedicines);

// Add medicine to patient
router.post('/patient-medicine', medicineController.addPatientMedicine);

// Get patient's medicines
router.get('/patient-medicines/:patientId', medicineController.getPatientMedicines);

// Add this new route
router.get('/all-records', medicineController.getAllMedicineRecords);

module.exports = router; 