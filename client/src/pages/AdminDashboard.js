import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaUserNurse, FaHospital, FaProcedures, FaSignOutAlt } from 'react-icons/fa';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('adminUsername');

  const handleLogout = () => {
    localStorage.removeItem('adminUsername');
    navigate('/admin');
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {username}</h1>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate('/admin/doctors')}>
          <FaUserMd />
          <h2>Manage Doctors</h2>
          <p>Add, update, or remove doctors</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/admin/nurses')}>
          <FaUserNurse />
          <h2>Manage Nurses</h2>
          <p>Add, update, or remove nurses</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/admin/departments')}>
          <FaHospital />
          <h2>Manage Departments</h2>
          <p>Manage hospital departments</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/admin/rooms')}>
          <FaProcedures />
          <h2>Manage Rooms</h2>
          <p>Configure room types and costs</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 