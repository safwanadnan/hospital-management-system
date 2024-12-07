const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.get('/search-patients', patientController.searchPatients);
router.get('/patient/:patientId', patientController.getPatientDetails);
router.get('/patient-update/:patientId', patientController.getPatientForUpdate);
router.put('/patient-update/:patientId', patientController.updatePatient);
router.post('/register-patient', patientController.registerPatient);
router.get('/next-patient-id', patientController.getNextPatientId);

module.exports = router; 