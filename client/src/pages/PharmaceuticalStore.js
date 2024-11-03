import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './PharmaceuticalStore.css';

function PharmaceuticalStore() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState('CROCINE');
  const [quantity, setQuantity] = useState(0);
  const [medicines, setMedicines] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const medicineOptions = [
    'CROCINE',
    'PARACETAMOL',
    'ASPIRIN',
    'IBUPROFEN',
    // Add more medicine options as needed
  ];

  const handleSave = () => {
    if (patientId && selectedMedicine && quantity > 0) {
      const newMedicine = {
        sno: medicines.length + 1,
        medicineName: selectedMedicine,
        quantity: quantity
      };
      setMedicines([...medicines, newMedicine]);
    }
  };

  const handleClear = () => {
    setPatientId('');
    setSelectedMedicine('CROCINE');
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
            >
              {medicineOptions.map((medicine) => (
                <option key={medicine} value={medicine}>
                  {medicine}
                </option>
              ))}
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