import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './MedicalTests.css';

function MedicalTests() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [selectedTest, setSelectedTest] = useState('X-RAY');
  const [tests, setTests] = useState([]);

  const testOptions = [
    'X-RAY',
    'Blood Test',
    'MRI',
    'CT Scan',
    'Ultrasound',
    // Add more test options as needed
  ];

  const handleSave = () => {
    if (patientId && selectedTest) {
      const newTest = {
        sno: tests.length + 1,
        testName: selectedTest
      };
      setTests([...tests, newTest]);
    }
  };

  const handleClear = () => {
    setPatientId('');
    setSelectedTest('X-RAY');
    setTests([]);
  };

  return (
    <div className="medical-tests-container">
      <button className="back-button" onClick={() => navigate('/')}>
        <FaArrowLeft /> Back
      </button>

      <h1 className="medical-tests-title">Medical Tests</h1>

      <div className="medical-tests-content">
        <div className="form-section">
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
            <label htmlFor="selectTests">Select Tests</label>
            <select
              id="selectTests"
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
            >
              {testOptions.map((test) => (
                <option key={test} value={test}>
                  {test}
                </option>
              ))}
            </select>
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

        <div className="table-section">
          <table className="tests-table">
            <thead>
              <tr>
                <th>Sno.</th>
                <th>Test Name</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.sno}>
                  <td>{test.sno}</td>
                  <td>{test.testName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MedicalTests; 