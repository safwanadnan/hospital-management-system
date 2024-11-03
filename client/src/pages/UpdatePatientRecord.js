import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserEdit } from 'react-icons/fa';
import './UpdatePatientRecord.css';

function UpdatePatientRecord() {
  const navigate = useNavigate();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    // Add API call to update patient record
    console.log('Updating patient record:', formData);
  };

  const relationOptions = [
    'Father',
    'Mother',
    'Spouse',
    'Sibling',
    'Other'
  ];

  return (
    <div className="update-patient-container">
      <button className="back-button" onClick={() => navigate('/receptionist')}>
        <FaArrowLeft /> Back
      </button>

      <h1 className="update-title">UPDATE PATIENT RECORD</h1>

      <form className="update-form" onSubmit={handleUpdate}>
        <div className="form-section main-info">
          <div className="form-group">
            <label htmlFor="patientId">Enter Patient ID</label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
            />
          </div>

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
    </div>
  );
}

export default UpdatePatientRecord; 