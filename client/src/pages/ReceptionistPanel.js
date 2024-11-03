// client/src/pages/ReceptionistPanel.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaFileInvoiceDollar, FaSearch, FaUserEdit, FaArrowLeft } from 'react-icons/fa';
import './ReceptionistPanel.css';

function ReceptionistPanel() {
  const navigate = useNavigate();

  return (
    <div className="receptionist-panel">
      <button className="back-button" onClick={() => navigate('/')}>
        <FaArrowLeft /> Back
      </button>
      <h1 className="panel-title">HHS General Hospital</h1>
      <div className="button-container">
        <button 
          className="option-button patient-registration"
          onClick={() => navigate('/patient-registration')}
        >
          <FaUserPlus size={24} />
          <span>Patient Registration</span>
        </button>
        <button 
          className="option-button bill-generation"
          onClick={() => navigate('/bill-generation')}
        >
          <FaFileInvoiceDollar size={24} />
          <span>Bill Generation</span>
        </button>
        <button 
          className="option-button search-patient"
          onClick={() => navigate('/search-patient')}
        >
          <FaSearch size={24} />
          <span>Search Patient Details</span>
        </button>
        <button 
          className="option-button update-record"
          onClick={() => navigate('/update-patient')}
        >
          <FaUserEdit size={24} />
          <span>Update Patient Record</span>
        </button>
      </div>
    </div>
  );
}

export default ReceptionistPanel;
