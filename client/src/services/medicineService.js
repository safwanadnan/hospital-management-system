import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const medicineService = {
  getAllMedicines: () => axios.get(`${API_URL}/medicines`),
  addPatientMedicine: (data) => axios.post(`${API_URL}/patient-medicine`, data),
  getPatientMedicines: (patientId) => axios.get(`${API_URL}/patient-medicines/${patientId}`)
}; 