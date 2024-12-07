import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimesCircle } from 'react-icons/fa';
import './PatientRegistration.css';

function PatientRegistration() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    // Get next available patient ID when component mounts
    const fetchNextPatientId = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/next-patient-id');
        if (!response.ok) throw new Error('Failed to get next patient ID');
        const data = await response.json();
        setFormData(prev => ({ ...prev, patientId: data.nextId }));
      } catch (error) {
        console.error('Error fetching next patient ID:', error);
      }
    };

    fetchNextPatientId();
  }, []);

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
      const response = await fetch('http://localhost:5000/api/register-patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          phoneNumbers: [formData.mobileNo1, formData.mobileNo2].filter(Boolean),
          isInPatient: activeTab === 'inPatient'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to register patient');
      }

      const data = await response.json();
      alert(`Patient registered successfully with ID: ${data.patientId}`);
      handleClearFields();
      navigate(-1);
    } catch (err) {
      console.error('Error registering patient:', err);
      setError('Failed to register patient. Please try again.');
    } finally {
      setLoading(false);
    }
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

      {error && <div className="error-message">{error}</div>}

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

      <form className="registration-form" onSubmit={handleSubmit}>
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
          <button type="submit" className="save-button" disabled={loading}>
            <FaSave /> {loading ? 'SAVING...' : 'SAVE'}
          </button>
          <button 
            type="button" 
            className="clear-button" 
            onClick={handleClearFields}
            disabled={loading}
          >
            <FaTimesCircle /> CLEAR FIELDS
          </button>
        </div>
      </form>
    </div>
  );
}

export default PatientRegistration; 