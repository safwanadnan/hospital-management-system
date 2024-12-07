import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './PharmaceuticalStore.css';
import { medicineService } from '../services/medicineService';

function PharmaceuticalStore() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [allMedicineRecords, setAllMedicineRecords] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAvailableMedicines();
    fetchAllMedicineRecords();
  }, []);

  const fetchAllMedicineRecords = async () => {
    try {
      const response = await medicineService.getAllMedicineRecords();
      console.log('Medicine records:', response.data);
      setAllMedicineRecords(response.data);
    } catch (error) {
      console.error('Error fetching medicine records:', error);
    }
  };

  const fetchAvailableMedicines = async () => {
    setIsLoading(true);
    try {
      const response = await medicineService.getAllMedicines();
      console.log('Available medicines:', response.data);
      setAvailableMedicines(response.data);
      if (response.data.length > 0) {
        setSelectedMedicine(response.data[0].MNAME);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (patientId && selectedMedicine && quantity > 0) {
      try {
        const selectedMedicineObj = availableMedicines.find(m => m.MNAME === selectedMedicine);
        
        if (!selectedMedicineObj) {
          alert('Selected medicine not found');
          return;
        }

        const requestData = {
          patientId: parseInt(patientId),
          medicines: [{
            mid: selectedMedicineObj.MID,
            quantity: parseInt(quantity)
          }],
          date: date
        };

        const response = await medicineService.addPatientMedicine(requestData);

        if (response.data.success) {
          // Reset form fields
          setSelectedMedicine(availableMedicines[0]?.MNAME || '');
          setQuantity(0);
          setPatientId('');
          
          // Refresh the medicine records
          fetchAllMedicineRecords();
          
          alert('Medicine added successfully');
        }
      } catch (error) {
        console.error('Error saving medicine:', error);
        const errorMessage = error.response?.data?.error || error.message;
        alert('Error adding medicine: ' + errorMessage);
      }
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleClear = () => {
    setPatientId('');
    setSelectedMedicine(availableMedicines[0]?.MNAME || '');
    setQuantity(0);
  };

  return (
    <div className="pharmaceutical-store-container">
      <button className="back-button" onClick={() => navigate('/')}>
        <FaArrowLeft /> Back
      </button>

      <h1 className="store-title">PHARMACEUTICAL STORE</h1>

      <div className="store-content">
        {/* Form section */}
        <div className="form-section">
          <h2>Add New Medicine Record</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="patientId">Enter Patient ID</label>
              <input
                type="text"
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="selectMedicine">Select Medicine</label>
              <select
                id="selectMedicine"
                value={selectedMedicine}
                onChange={(e) => setSelectedMedicine(e.target.value)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <option>Loading medicines...</option>
                ) : availableMedicines.length === 0 ? (
                  <option>No medicines available</option>
                ) : (
                  availableMedicines.map((medicine) => (
                    <option key={medicine.MID} value={medicine.MNAME}>
                      {medicine.MNAME}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          <div className="button-group">
            <button className="action-button save-button" onClick={handleSave}>
              SAVE
            </button>
            <button className="action-button clear-button" onClick={handleClear}>
              CLEAR
            </button>
          </div>
        </div>

        {/* Records Table */}
        <div className="table-section">
          <h2>Medicine Records</h2>
          <table className="medicines-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Medicine Name</th>
                <th>Quantity</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {allMedicineRecords.map((record, index) => (
                <tr key={index}>
                  <td>{record.PID}</td>
                  <td>{record.MNAME}</td>
                  <td>{record.QTY}</td>
                  <td>{record.MED_DATE}</td>
                </tr>
              ))}
              {allMedicineRecords.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No medicine records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PharmaceuticalStore;
