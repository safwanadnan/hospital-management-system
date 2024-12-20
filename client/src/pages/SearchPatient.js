import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaTimesCircle } from 'react-icons/fa';
import './SearchPatient.css';

function SearchPatient() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/search-patients?searchType=${searchType}&searchQuery=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data);
      
      if (data.length === 0) {
        setError('No patients found');
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      setError('Error searching patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFields = () => {
    setSearchType('name');
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
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
            <button className="search-button" onClick={handleSearch} disabled={loading}>
              <FaSearch /> {loading ? 'Searching...' : 'SEARCH'}
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>

        {searchResults.length > 0 && (
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
                      <td>{patient.dateAdmitted || '-'}</td>
                      <td>{patient.dateDischarged || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button className="clear-button" onClick={handleClearFields}>
          <FaTimesCircle /> CLEAR FIELDS
        </button>
      </div>
    </div>
  );
}

export default SearchPatient; 