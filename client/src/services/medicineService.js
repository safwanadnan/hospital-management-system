import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const medicineService = {
  getAllMedicines: () => axios.get(`${API_URL}/medicines`),
  
  addPatientMedicine: (data) => {
    console.log('Making API call to add medicine:', data);
    return axios.post(`${API_URL}/medicines/patient-medicine`, data);
  },
  
  getPatientMedicines: (patientId) => 
    axios.get(`${API_URL}/medicines/patient-medicines/${patientId}`),
  
  getAllMedicineRecords: () => 
    axios.get(`${API_URL}/medicines/all-records`)
};