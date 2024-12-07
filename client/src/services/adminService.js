import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/admin';

export const adminService = {
  // Doctors
  getDoctors: () => axios.get(`${BASE_URL}/doctors`),
  addDoctor: (doctorData) => axios.post(`${BASE_URL}/doctors`, doctorData),
  updateDoctor: (id, doctorData) => axios.put(`${BASE_URL}/doctors/${id}`, doctorData),
  deleteDoctor: (id) => axios.delete(`${BASE_URL}/doctors/${id}`),

  // Nurses
  getNurses: () => axios.get(`${BASE_URL}/nurses`),
  addNurse: (nurseData) => axios.post(`${BASE_URL}/nurses`, nurseData),
  updateNurse: (id, nurseData) => axios.put(`${BASE_URL}/nurses/${id}`, nurseData),
  deleteNurse: (id) => axios.delete(`${BASE_URL}/nurses/${id}`),

  // Departments
  getDepartments: () => axios.get(`${BASE_URL}/departments`),
  addDepartment: (deptData) => axios.post(`${BASE_URL}/departments`, deptData),
  updateDepartment: (id, deptData) => axios.put(`${BASE_URL}/departments/${id}`, deptData),
  deleteDepartment: (id) => axios.delete(`${BASE_URL}/departments/${id}`),

  // Rooms
  getRooms: () => axios.get(`${BASE_URL}/rooms`),
  getRoomCosts: () => axios.get(`${BASE_URL}/room-costs`),
  addRoom: (roomData) => axios.post(`${BASE_URL}/rooms`, roomData),
  addRoomCost: (costData) => axios.post(`${BASE_URL}/room-costs`, costData),
  updateRoom: (id, roomData) => axios.put(`${BASE_URL}/rooms/${id}`, roomData),
  updateRoomCost: (type, costData) => axios.put(`${BASE_URL}/room-costs/${type}`, costData),
  deleteRoom: (id) => axios.delete(`${BASE_URL}/rooms/${id}`),
  deleteRoomCost: (type) => axios.delete(`${BASE_URL}/room-costs/${type}`),
}; 