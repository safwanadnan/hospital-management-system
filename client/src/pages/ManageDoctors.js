import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import './ManagePages.css';

function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    empid: '',
    fname: '',
    mname: '',
    lname: '',
    gender: '',
    deptid: '',
    email: '',
    date_of_birth: '',
    street: '',
    city: '',
    state: '',
    Hno: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await adminService.getDoctors();
      setDoctors(response.data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await adminService.updateDoctor(formData.empid, formData);
      } else {
        await adminService.addDoctor(formData);
      }
      loadDoctors();
      resetForm();
    } catch (error) {
      console.error('Error saving doctor:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await adminService.deleteDoctor(id);
        loadDoctors();
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
  };

  const handleEdit = (doctor) => {
    setFormData({
      empid: doctor.EMPID,
      fname: doctor.FNAME,
      mname: doctor.MNAME || '',
      lname: doctor.LNAME || '',
      gender: doctor.GENDER,
      deptid: doctor.DEPTID,
      email: doctor.EMAIL || '',
      date_of_birth: doctor.DATE_OF_BIRTH ? doctor.DATE_OF_BIRTH.split('T')[0] : '',
      street: doctor.STREET || '',
      city: doctor.CITY || '',
      state: doctor.STATE || '',
      Hno: doctor.HNO || ''
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      empid: '',
      fname: '',
      mname: '',
      lname: '',
      gender: '',
      deptid: '',
      email: '',
      date_of_birth: '',
      street: '',
      city: '',
      state: '',
      Hno: ''
    });
    setIsEditing(false);
  };

  return (
    <div className="manage-page">
      <h1>Manage Doctors</h1>
      
      <form onSubmit={handleSubmit} className="manage-form">
        <input
          type="text"
          placeholder="Employee ID"
          value={formData.empid}
          onChange={(e) => setFormData({...formData, empid: e.target.value})}
          required
          disabled={isEditing}
        />
        <input
          type="text"
          placeholder="First Name"
          value={formData.fname}
          onChange={(e) => setFormData({...formData, fname: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Middle Name"
          value={formData.mname}
          onChange={(e) => setFormData({...formData, mname: e.target.value})}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formData.lname}
          onChange={(e) => setFormData({...formData, lname: e.target.value})}
          required
        />
        <select
          value={formData.gender}
          onChange={(e) => setFormData({...formData, gender: e.target.value})}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <input
          type="number"
          placeholder="Department ID"
          value={formData.deptid}
          onChange={(e) => setFormData({...formData, deptid: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <input
          type="date"
          placeholder="Date of Birth"
          value={formData.date_of_birth}
          onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="House No"
          value={formData.Hno}
          onChange={(e) => setFormData({...formData, Hno: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Street"
          value={formData.street}
          onChange={(e) => setFormData({...formData, street: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="City"
          value={formData.city}
          onChange={(e) => setFormData({...formData, city: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="State"
          value={formData.state}
          onChange={(e) => setFormData({...formData, state: e.target.value})}
          required
        />
        
        <button type="submit">{isEditing ? 'Update' : 'Add'} Doctor</button>
        {isEditing && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map(doctor => (
              <tr key={doctor.EMPID}>
                <td>{doctor.EMPID}</td>
                <td>{`${doctor.FNAME} ${doctor.MNAME || ''} ${doctor.LNAME || ''}`}</td>
                <td>{doctor.DEPTID}</td>
                <td>{doctor.EMAIL}</td>
                <td>
                  <button onClick={() => handleEdit(doctor)}>Edit</button>
                  <button onClick={() => handleDelete(doctor.EMPID)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageDoctors; 