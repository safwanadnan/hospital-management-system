// client/src/App.js

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import './App.css';
import { FaUserNurse, FaUserCog, FaFlask, FaPills } from 'react-icons/fa';

function HomePage() {
  return (
    <div className="App">
      <header className="app-header">
        <h1 className="app-title">HHS General Hospital</h1>
        <p className="app-subtitle">Healthcare Management System</p>
      </header>
      <div className="button-container">
        <Link to="/receptionist" className="panel-link">
          <button className="panel-button receptionist-panel">
            <FaUserNurse className="panel-icon" />
            <span>Receptionist Panel</span>
          </button>
        </Link>
        <Link to="/admin" className="panel-link">
          <button className="panel-button admin-panel">
            <FaUserCog className="panel-icon" />
            <span>Admin Panel</span>
          </button>
        </Link>
        <Link to="/medical-tests" className="panel-link">
          <button className="panel-button medical-tests">
            <FaFlask className="panel-icon" />
            <span>Medical Tests</span>
          </button>
        </Link>
        <Link to="/medicines" className="panel-link">
          <button className="panel-button medicines">
            <FaPills className="panel-icon" />
            <span>Medicines</span>
          </button>
        </Link>
      </div>
    </div>
  );
}

// Lazy load route components
const ReceptionistPanel = React.lazy(() => import('./pages/ReceptionistPanel'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const MedicalTests = React.lazy(() => import('./pages/MedicalTests'));
const PharmaceuticalStore = React.lazy(() => import('./pages/PharmaceuticalStore'));
const BillGeneration = React.lazy(() => import('./pages/BillGeneration'));
const SearchPatient = React.lazy(() => import('./pages/SearchPatient'));
const UpdatePatientRecord = React.lazy(() => import('./pages/UpdatePatientRecord'));
const PatientRegistration = React.lazy(() => import('./pages/PatientRegistration'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const ManageDoctors = React.lazy(() => import('./pages/ManageDoctors'));
const ManageNurses = React.lazy(() => import('./pages/ManageNurses'));
const ManageDepartments = React.lazy(() => import('./pages/ManageDepartments'));
const ManageRooms = React.lazy(() => import('./pages/ManageRooms'));

function NotFound() {
  return (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <Link to="/">Return Home</Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="loading">Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/receptionist" element={<ReceptionistPanel />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/doctors" element={<ManageDoctors />} />
          <Route path="/admin/nurses" element={<ManageNurses />} />
          <Route path="/admin/departments" element={<ManageDepartments />} />
          <Route path="/admin/rooms" element={<ManageRooms />} />
          <Route path="/medical-tests" element={<MedicalTests />} />
          <Route path="/medicines" element={<PharmaceuticalStore />} />
          <Route path="/bill-generation" element={<BillGeneration />} />
          <Route path="/search-patient" element={<SearchPatient />} />
          <Route path="/update-patient" element={<UpdatePatientRecord />} />
          <Route path="/patient-registration" element={<PatientRegistration />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
