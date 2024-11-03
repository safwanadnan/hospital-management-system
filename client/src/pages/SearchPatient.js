import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaTimesCircle } from 'react-icons/fa';
import './SearchPatient.css';

function SearchPatient() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = () => {
    // Mock data - replace with actual API call
    const mockData = [
      {
        patientId: 'P001',
        patientName: 'John Doe',
        gender: 'Male',
        address: '123 Main St',
        doctorAssigned: 'Dr. Smith',
        roomAdmitted: '301',
        dateAdmitted: '2024-01-15',
        dateDischarged: '2024-01-20'
      }
      // Add more mock data as needed
    ];
    setSearchResults(mockData);
  };

  const handleClearFields = () => {
    setSearchType('name');
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="search-patient-container">
      <button className="back-button" onClick={() => navigate('/receptionist')}>
        <FaArrowLeft /> Back
      </button>

      <h1 className="search-title">SEARCH PATIENT DETAILS</h1>

      <div className="search-content">
        <div className="search-card">
          <h2>SEARCH BY</h2>
          <div className="search-options">
            <label className="radio-label">
              <input
                type="radio"
                name="searchType"
                value="name"
                checked={searchType === 'name'}
                onChange={(e) => setSearchType(e.target.value)}
              />
              <span>Name</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="searchType"
                value="patientId"
                checked={searchType === 'patientId'}
                onChange={(e) => setSearchType(e.target.value)}
              />
              <span>Patient ID</span>
            </label>
          </div>

          <div className="search-input-group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Enter patient ${searchType === 'name' ? 'name' : 'ID'}`}
            />
            <button className="search-button" onClick={handleSearch}>
              <FaSearch /> SEARCH
            </button>
          </div>
        </div>

        <div className="results-section">
          <div className="table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>Gender</th>
                  <th>Address</th>
                  <th>Doctor Assigned</th>
                  <th>Room Admitted</th>
                  <th>Date Admitted</th>
                  <th>Date Discharged</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((patient, index) => (
                  <tr key={index}>
                    <td>{patient.patientId}</td>
                    <td>{patient.patientName}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.address}</td>
                    <td>{patient.doctorAssigned}</td>
                    <td>{patient.roomAdmitted}</td>
                    <td>{patient.dateAdmitted}</td>
                    <td>{patient.dateDischarged || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button className="clear-button" onClick={handleClearFields}>
          <FaTimesCircle /> CLEAR FIELDS
        </button>
      </div>
    </div>
  );
}

export default SearchPatient; 