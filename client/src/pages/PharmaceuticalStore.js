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
  const [medicines, setMedicines] = useState([]);
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch available medicines when component mounts
    fetchAvailableMedicines();
  }, []);

  const fetchAvailableMedicines = async () => {
    setIsLoading(true);
    try {
      const response = await medicineService.getAllMedicines();
      console.log('Medicines response:', response);
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
        
        const response = await medicineService.addPatientMedicine({
          patientId: parseInt(patientId),
          medicines: [{
            mid: selectedMedicineObj.MID,
            quantity: quantity
          }],
          date: date
        });

        if (response.status === 200) {
          const newMedicine = {
            sno: medicines.length + 1,
            medicineName: selectedMedicine,
            quantity: quantity
          };
          setMedicines([...medicines, newMedicine]);
        }
      } catch (error) {
        console.error('Error saving medicine:', error);
      }
    }
  };

  const handleClear = () => {
    setPatientId('');
    setSelectedMedicine('');
    setQuantity(0);
    setMedicines([]);
  };

  return (
    <div className="pharmaceutical-store-container">
      <button className="back-button" onClick={() => navigate('/')}>
        <FaArrowLeft /> Back
      </button>

      <h1 className="store-title">PHARMACEUTICAL STORE</h1>

      <div className="store-content">
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
                availableMedicines.map((medicine) => {
                  console.log('Rendering medicine:', medicine);
                  return (
                    <option key={medicine.MID} value={medicine.MNAME}>
                      {medicine.MNAME || 'Unnamed medicine'}
                    </option>
                  );
                })
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

        <div className="table-section">
          <table className="medicines-table">
            <thead>
              <tr>
                <th>Sno.</th>
                <th>Medicine Name</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((medicine) => (
                <tr key={medicine.sno}>
                  <td>{medicine.sno}</td>
                  <td>{medicine.medicineName}</td>
                  <td>{medicine.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
}

export default PharmaceuticalStore; 