import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFileInvoice, FaTimesCircle } from 'react-icons/fa';
import './BillGeneration.css';

function BillGeneration() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [patientDetails, setPatientDetails] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [tests, setTests] = useState([]);
  const [roomBill, setRoomBill] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateTotalMedicineCost = () => {
    return medicines.reduce((total, med) => total + (med.totalCost || 0), 0);
  };

  const calculateTotalTestsCost = () => {
    return tests.reduce((total, test) => total + (test.cost || 0), 0);
  };

  const calculateTotalPayable = () => {
    return (
      calculateTotalMedicineCost() +
      calculateTotalTestsCost() +
      Number(roomBill || 0)
    );
  };

  const searchPatient = async () => {
    if (!patientId.trim()) {
      setError('Please enter a Patient ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/bills/patient-bill/${patientId}`);
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server not responding properly. Please check if the server is running.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch patient details');
      }

      if (!data.patientDetails) {
        throw new Error('No patient found with this ID');
      }

      setPatientDetails(data.patientDetails);
      setMedicines(data.medicines || []);
      setTests(data.tests || []);
      setRoomBill(data.roomCharges || 0);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to connect to server. Please check if the server is running.');
      setPatientDetails(null);
      setMedicines([]);
      setTests([]);
      setRoomBill(0);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bills/generate-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patientId,
          medicineCost: calculateTotalMedicineCost(),
          testCost: calculateTotalTestsCost(),
          roomCharges: Number(roomBill),
          otherCharges: 0
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate bill');
      }

      alert('Bill generated successfully');
      // Clear all data after successful bill generation
      setPatientId('');
      setPatientDetails(null);
      setMedicines([]);
      setTests([]);
      setRoomBill(0);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate bill: ' + error.message);
    }
  };

  return (
    <div className="bill-generation-container">
      <button className="back-button" onClick={() => navigate('/receptionist')}>
        <FaArrowLeft /> Back
      </button>

      <h1 className="bill-title">BILL GENERATION</h1>

      <div className="bill-content">
        <div className="search-section">
          <div className="form-group">
            <label htmlFor="patientId">Enter Patient ID</label>
            <div className="search-input-group">
              <input
                type="text"
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter Patient ID"
              />
              <button onClick={searchPatient} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>

        {patientDetails && (
          <>
            <div className="details-card">
              <h2>Patient Details</h2>
              <div className="patient-info-grid">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{patientDetails.name}</span>
                </div>
                <div className="info-item">
                  <label>Gender:</label>
                  <span>{patientDetails.gender}</span>
                </div>
                <div className="info-item">
                  <label>Address:</label>
                  <span>{patientDetails.address}</span>
                </div>
                <div className="info-item">
                  <label>Disease Treated:</label>
                  <span>{patientDetails.diseaseTreated}</span>
                </div>
              </div>
            </div>

            {medicines.length > 0 && (
              <div className="table-card">
                <h2>Medicines Given</h2>
                <table className="bill-table">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Medicine Name</th>
                      <th>Quantity</th>
                      <th>Cost per Unit</th>
                      <th>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((medicine, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{medicine.name}</td>
                        <td>{medicine.quantity}</td>
                        <td>${medicine.cost}</td>
                        <td>${medicine.totalCost}</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td colSpan="4">Total Medicine Cost</td>
                      <td>${calculateTotalMedicineCost()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {tests.length > 0 && (
              <div className="table-card">
                <h2>Tests Performed</h2>
                <table className="bill-table">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Test Name</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((test, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{test.name}</td>
                        <td>${test.cost}</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td colSpan="2">Total Test Cost</td>
                      <td>${calculateTotalTestsCost()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {roomBill > 0 && (
              <div className="summary-card">
                <h2>Room Charges</h2>
                <div className="summary-row">
                  <span>Room Bill</span>
                  <span>${roomBill}</span>
                </div>
              </div>
            )}

            <div className="summary-card total">
              <div className="summary-row">
                <h2>Total Payable Amount</h2>
                <h2>${calculateTotalPayable()}</h2>
              </div>
            </div>

            <div className="action-buttons">
              <button className="generate-button" onClick={handleGenerateBill}>
                <FaFileInvoice /> GENERATE BILL
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BillGeneration; 