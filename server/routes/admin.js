const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/login', adminController.login);

// Doctors routes
router.get('/doctors', adminController.getDoctors);
router.post('/doctors', adminController.addDoctor);
router.put('/doctors/:id', adminController.updateDoctor);
router.delete('/doctors/:id', adminController.deleteDoctor);

// Nurses routes
router.get('/nurses', adminController.getNurses);
router.post('/nurses', adminController.addNurse);
router.put('/nurses/:id', adminController.updateNurse);
router.delete('/nurses/:id', adminController.deleteNurse);

// Departments routes
router.get('/departments', adminController.getDepartments);
router.post('/departments', adminController.addDepartment);
router.put('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

// Rooms routes
router.get('/rooms', adminController.getRooms);
router.get('/room-costs', adminController.getRoomCosts);
router.post('/rooms', adminController.addRoom);
router.post('/room-costs', adminController.addRoomCost);
router.put('/rooms/:id', adminController.updateRoom);
router.put('/room-costs/:type', adminController.updateRoomCost);
router.delete('/rooms/:id', adminController.deleteRoom);
router.delete('/room-costs/:type', adminController.deleteRoomCost);

module.exports = router; 