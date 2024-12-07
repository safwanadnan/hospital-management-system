import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './MedicalTests.css';

function MedicalTests() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [selectedTest, setSelectedTest] = useState('');
  const [availableTests, setAvailableTests] = useState([]);
  const [allTestRecords, setAllTestRecords] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAvailableTests();
    fetchAllTestRecords();
  }, []);

  const fetchAllTestRecords = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tests/all-records');
      const data = await response.json();
      console.log('Test records:', data);
      setAllTestRecords(data);
    } catch (error) {
      console.error('Error fetching test records:', error);
    }
  };

  const fetchAvailableTests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/tests');
      const data = await response.json();
      console.log('Available tests:', data);
      setAvailableTests(data);
      if (data.length > 0) {
        setSelectedTest(data[0].TNAME);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (patientId && selectedTest) {
      try {
        const selectedTestObj = availableTests.find(t => t.TNAME === selectedTest);
        
        if (!selectedTestObj) {
          alert('Selected test not found');
          return;
        }

        const response = await fetch('http://localhost:5000/api/tests/patient-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patientId: parseInt(patientId),
            testId: selectedTestObj.TID,
            date: date
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Reset form fields
          setSelectedTest(availableTests[0]?.TNAME || '');
          setPatientId('');
          
          // Refresh the test records
          fetchAllTestRecords();
          
          alert('Test added successfully');
        }
      } catch (error) {
        console.error('Error saving test:', error);
        alert('Error adding test: ' + error.message);
      }
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleClear = () => {
    setPatientId('');
    setSelectedTest(availableTests[0]?.TNAME || '');
  };

  return (
    <div className="medical-tests-container">
      <button className="back-button" onClick={() => navigate('/')}>
        <FaArrowLeft /> Back
      </button>

      <h1 className="medical-tests-title">MEDICAL TESTS</h1>

      <div className="medical-tests-content">
        {/* Form section */}
        <div className="form-section">
          <h2>Add New Test Record</h2>
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
              <label htmlFor="selectTest">Select Test</label>
              <select
                id="selectTest"
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <option>Loading tests...</option>
                ) : availableTests.length === 0 ? (
                  <option>No tests available</option>
                ) : (
                  availableTests.map((test) => (
                    <option key={test.TID} value={test.TNAME}>
                      {test.TNAME}
                    </option>
                  ))
                )}
              </select>
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
          <h2>Test Records</h2>
          <table className="tests-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Test Name</th>
                <th>Date</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {allTestRecords.map((record, index) => (
                <tr key={index}>
                  <td>{record.PID}</td>
                  <td>{record.TNAME}</td>
                  <td>{record.TEST_DATE}</td>
                  <td>${record.TCOST}</td>
                </tr>
              ))}
              {allTestRecords.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No test records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MedicalTests;