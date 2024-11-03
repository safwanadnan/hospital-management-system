import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimesCircle } from 'react-icons/fa';
import './PatientRegistration.css';

function PatientRegistration() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({
    patientId: '',
    firstName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: '',
    bloodGroup: 'A+',
    phoneNo1: '',
    phoneNo2: '',
    email: '',
    houseNo: '',
    street: '',
    city: '',
    state: '',
    problem: 'ALLERGY',
    referredRoom: '',
    referredWard: ''
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const problems = ['ALLERGY', 'FEVER', 'INJURY', 'SURGERY', 'OTHER'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Add API call to save patient data
    console.log('Saving patient data:', formData);
  };

  const handleClearFields = () => {
    setFormData({
      patientId: '',
      firstName: '',
      lastName: '',
      gender: 'Male',
      dateOfBirth: '',
      bloodGroup: 'A+',
      phoneNo1: '',
      phoneNo2: '',
      email: '',
      houseNo: '',
      street: '',
      city: '',
      state: '',
      problem: 'ALLERGY',
      referredRoom: '',
      referredWard: ''
    });
  };

  return (
    <div className="patient-registration-container">
      <button className="back-button" onClick={() => navigate('/receptionist')}>
        <FaArrowLeft /> Back
      </button>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Patient Details
        </button>
        <button 
          className={`tab ${activeTab === 'inpatient' ? 'active' : ''}`}
          onClick={() => setActiveTab('inpatient')}
        >
          Inpatient Info
        </button>
      </div>

      <form className="registration-form" onSubmit={handleSave}>
        <div className="form-content">
          <div className="form-group">
            <label htmlFor="patientId">Patient ID</label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-section basic-details">
            <h2>Basic Details</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
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
                <label htmlFor="dateOfBirth">Date of Birth *</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="bloodGroup">Blood Group</label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                >
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {activeTab === 'details' ? (
            <>
              <div className="form-section other-details">
                <h2>Other Details</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phoneNo1">Phone No.1</label>
                    <input
                      type="tel"
                      id="phoneNo1"
                      name="phoneNo1"
                      value={formData.phoneNo1}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phoneNo2">Phone No.2</label>
                    <input
                      type="tel"
                      id="phoneNo2"
                      name="phoneNo2"
                      value={formData.phoneNo2}
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

              <div className="form-section address-details">
                <h2>Address Details</h2>
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
            </>
          ) : (
            <div className="form-section disease-info">
              <h2>Disease Info</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="problem">Problem</label>
                  <select
                    id="problem"
                    name="problem"
                    value={formData.problem}
                    onChange={handleInputChange}
                  >
                    {problems.map(problem => (
                      <option key={problem} value={problem}>{problem}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="referredRoom">Referred Room</label>
                  <input
                    type="text"
                    id="referredRoom"
                    name="referredRoom"
                    value={formData.referredRoom}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="referredWard">Referred Ward</label>
                  <input
                    type="text"
                    id="referredWard"
                    name="referredWard"
                    value={formData.referredWard}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">
            <FaSave /> SAVE
          </button>
          <button type="button" className="clear-button" onClick={handleClearFields}>
            <FaTimesCircle /> CLEAR FIELDS
          </button>
        </div>
      </form>
    </div>
  );
}

export default PatientRegistration; 