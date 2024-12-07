import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './MedicalTests.css';

function MedicalTests() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [selectedTest, setSelectedTest] = useState('X-RAY');
  const [tests, setTests] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);

  useEffect(() => {
    // Fetch available tests when component mounts
    fetchAvailableTests();
  }, []);

  const fetchAvailableTests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tests');
      const data = await response.json();
      setAvailableTests(data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const handleSave = async () => {
    if (patientId && selectedTest) {
      try {
        const selectedTestObj = availableTests.find(t => t.TNAME === selectedTest);
        
        const response = await fetch('http://localhost:5000/api/patient-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patientId: parseInt(patientId),
            testId: selectedTestObj.TID
          }),
        });

        if (response.ok) {
          const newTest = {
            sno: tests.length + 1,
            testName: selectedTest
          };
          setTests([...tests, newTest]);
        }
      } catch (error) {
        console.error('Error saving test:', error);
      }
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
              {availableTests.map((test) => (
                <option key={test.TID} value={test.TNAME}>
                  {test.TNAME}
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