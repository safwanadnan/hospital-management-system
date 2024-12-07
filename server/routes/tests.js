const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.get('/', testController.getAllTests);
router.post('/patient-test', testController.addPatientTest);
router.get('/patient-tests/:patientId', testController.getPatientTests);

module.exports = router; 