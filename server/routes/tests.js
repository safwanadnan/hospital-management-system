const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.get('/', testController.getAllTests);
router.post('/patient-test', testController.addPatientTest);
router.get('/patient-tests/:patientId', testController.getPatientTests);
router.get('/all-records', testController.getAllTestRecords);

module.exports = router; 