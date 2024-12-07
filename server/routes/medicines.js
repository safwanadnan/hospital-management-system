const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

router.get('/', medicineController.getAllMedicines);
router.post('/patient-medicine', medicineController.addPatientMedicine);
router.get('/patient-medicines/:patientId', medicineController.getPatientMedicines);

module.exports = router; 