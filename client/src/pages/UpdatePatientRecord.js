import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserEdit, FaSearch } from 'react-icons/fa';
import './UpdatePatientRecord.css';

function UpdatePatientRecord() {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patientFound, setPatientFound] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    houseNo: '',
    street: '',
    city: '',
    state: '',
    mobileNo1: '',
    mobileNo2: '',
    email: '',
    relativeName: '',
    relation: 'Father',
    relativePhone: ''
  });

  const relationOptions = ['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Other'];

  const searchPatient = async () => {
    if (!searchId.trim()) {
      setError('Please enter a patient ID');
      return;
    }

    setLoading(true);
    setError(null);
    setPatientFound(false);

    try {
      const response = await fetch(`http://localhost:5000/api/patient-update/${searchId}`);
      if (!response.ok) {
        throw new Error('Patient not found');
      }
      
      const data = await response.json();
      setFormData({
        patientId: data.PID,
        firstName: data.FNAME,
        lastName: data.LNAME || '',
        gender: data.GENDER,
        dateOfBirth: data.DOB,
        bloodGroup: data.BLOOD_GROUP || '',
        houseNo: data.HNO || '',
        street: data.STREET || '',
        city: data.CITY || '',
        state: data.STATE || '',
        mobileNo1: data.phones?.[0] || '',
        mobileNo2: data.phones?.[1] || '',
        email: data.EMAIL || '',
        relativeName: data.relative?.RNAME || '',
        relation: data.relative?.RTYPE || 'Father',
        relativePhone: data.relative?.PNO || ''
      });
      
      setPatientFound(true);
      setError(null);
    } catch (err) {
      console.error('Error searching patient:', err);
      setError(err.message);
      setPatientFound(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/patient-update/${formData.patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update patient record');
      }

      alert('Patient record updated successfully');
      navigate(-1);
    } catch (err) {
      console.error('Error updating patient:', err);
      setError('Failed to update patient record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-patient-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <h1 className="update-title">UPDATE PATIENT RECORD</h1>

      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Enter Patient ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button 
            className="search-button" 
            onClick={searchPatient}
            disabled={loading}
          >
            <FaSearch /> {loading ? 'Searching...' : 'SEARCH'}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>

      {patientFound && (
        <form onSubmit={handleSubmit} className="update-form">
          <div className="form-section personal-info">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === 'Male'}
                      onChange={handleInputChange}
                    />
                    Male
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === 'Female'}
                      onChange={handleInputChange}
                    />
                    Female
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bloodGroup">Blood Group</label>
                <input
                  type="text"
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section contact-info">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mobileNo1">Mobile No. 1</label>
                <input
                  type="tel"
                  id="mobileNo1"
                  name="mobileNo1"
                  value={formData.mobileNo1}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="mobileNo2">Mobile No. 2</label>
                <input
                  type="tel"
                  id="mobileNo2"
                  name="mobileNo2"
                  value={formData.mobileNo2}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-section address-info">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="houseNo">House No.</label>
                <input
                  type="text"
                  id="houseNo"
                  name="houseNo"
                  value={formData.houseNo}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="street">Street</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section relative-info">
            <h2>Relative Info</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="relativeName">Name</label>
                <input
                  type="text"
                  id="relativeName"
                  name="relativeName"
                  value={formData.relativeName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="relation">Relation</label>
                <select
                  id="relation"
                  name="relation"
                  value={formData.relation}
                  onChange={handleInputChange}
                >
                  {relationOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="relativePhone">Phone No.</label>
              <input
                type="tel"
                id="relativePhone"
                name="relativePhone"
                value={formData.relativePhone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <button type="submit" className="update-button">
            <FaUserEdit /> UPDATE
          </button>
        </form>
      )}
    </div>
  );
}

export default UpdatePatientRecord; 