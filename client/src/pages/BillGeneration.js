import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFileInvoice, FaTimesCircle } from 'react-icons/fa';
import './BillGeneration.css';

function BillGeneration() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [patientDetails, setPatientDetails] = useState({
    name: '',
    gender: '',
    address: '',
    diseaseTreated: ''
  });
  const [medicines, setMedicines] = useState([]);
  const [tests, setTests] = useState([]);
  const [roomBill, setRoomBill] = useState('');
  const [otherCharges, setOtherCharges] = useState('');

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
      Number(roomBill || 0) +
      Number(otherCharges || 0)
    );
  };

  const searchPatient = async () => {
    if (!patientId.trim()) {
      // Add error state and display
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/patient-bill/${patientId}`);
      if (!response.ok) {
        throw new Error('Patient not found');
      }

      const data = await response.json();
      
      setPatientDetails({
        name: data.patientDetails.name,
        gender: data.patientDetails.gender,
        address: data.patientDetails.address,
        diseaseTreated: data.patientDetails.diseaseTreated
      });
      
      setMedicines(data.medicines);
      setTests(data.tests);
      setRoomBill(data.roomCharges.toString());
      setOtherCharges('0');
    } catch (error) {
      console.error('Error fetching patient details:', error);
      // Add error state and display
    }
  };

  const handleGenerateBill = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/generate-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patientId,
          medicineCost: calculateTotalMedicineCost(),
          testCost: calculateTotalTestsCost(),
          roomCharges: Number(roomBill),
          otherCharges: Number(otherCharges)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate bill');
      }

      alert('Bill generated successfully');
      handleClearFields();
    } catch (error) {
      console.error('Error generating bill:', error);
      alert('Failed to generate bill');
    }
  };

  const handleClearFields = () => {
    setPatientId('');
    setPatientDetails({
      name: '',
      gender: '',
      address: '',
      diseaseTreated: ''
    });
    setMedicines([]);
    setTests([]);
    setRoomBill('');
    setOtherCharges('');
  };

  return (
    <div className="bill-generation-container">
      <button className="back-button" onClick={() => navigate('/receptionist')}>
        <FaArrowLeft /> Back
      </button>

      <h1 className="bill-title">BILL GENERATION</h1>

      <div className="bill-content">
        <div className="patient-section">
          <div className="form-group">
            <label htmlFor="patientId">Enter Patient ID</label>
            <div className="search-input-group">
              <input
                type="text"
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
              <button onClick={searchPatient}>Search</button>
            </div>
          </div>

          <div className="details-card">
            <h2>Patient Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={patientDetails.name}
                  onChange={(e) =>
                    setPatientDetails({ ...patientDetails, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <input
                  type="text"
                  id="gender"
                  value={patientDetails.gender}
                  onChange={(e) =>
                    setPatientDetails({ ...patientDetails, gender: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  value={patientDetails.address}
                  onChange={(e) =>
                    setPatientDetails({ ...patientDetails, address: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="disease">Disease Treated</label>
                <input
                  type="text"
                  id="disease"
                  value={patientDetails.diseaseTreated}
                  onChange={(e) =>
                    setPatientDetails({ ...patientDetails, diseaseTreated: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="billing-section">
          <div className="table-card">
            <h2>Medicines Given</h2>
            <table className="bill-table">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Medicine Name</th>
                  <th>Quantity</th>
                  <th>Cost</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((medicine, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{medicine.name}</td>
                    <td>{medicine.quantity}</td>
                    <td>{medicine.cost}</td>
                    <td>{medicine.totalCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="total-row">
              <span>Total Medicines Cost</span>
              <span>Rs. {calculateTotalMedicineCost()}</span>
            </div>
          </div>

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
                    <td>{test.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="summary-card">
            <div className="summary-row">
              <span>Total Tests Cost</span>
              <div className="amount-input">
                <span>Rs.</span>
                <input
                  type="number"
                  value={calculateTotalTestsCost()}
                  readOnly
                />
              </div>
            </div>
            <div className="summary-row">
              <span>Room Bill</span>
              <div className="amount-input">
                <span>Rs.</span>
                <input
                  type="number"
                  value={roomBill}
                  onChange={(e) => setRoomBill(e.target.value)}
                />
              </div>
            </div>
            <div className="summary-row">
              <span>Other Charges</span>
              <div className="amount-input">
                <span>Rs.</span>
                <input
                  type="number"
                  value={otherCharges}
                  onChange={(e) => setOtherCharges(e.target.value)}
                />
              </div>
            </div>
            <div className="summary-row total">
              <span>Total Payable Amount</span>
              <div className="amount-input">
                <span>Rs.</span>
                <input
                  type="number"
                  value={calculateTotalPayable()}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="generate-button" onClick={handleGenerateBill}>
            <FaFileInvoice /> GENERATE BILL
          </button>
          <button className="clear-button" onClick={handleClearFields}>
            <FaTimesCircle /> CLEAR FIELDS
          </button>
        </div>
      </div>
    </div>
  );
}

export default BillGeneration; 