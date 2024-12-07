import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import './ManagePages.css';

function ManageNurses() {
  const [nurses, setNurses] = useState([]);
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
    Hno: '',
    countpatient: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadNurses();
  }, []);

  const loadNurses = async () => {
    try {
      const response = await adminService.getNurses();
      setNurses(response.data);
    } catch (error) {
      console.error('Error loading nurses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await adminService.updateNurse(formData.empid, formData);
      } else {
        await adminService.addNurse(formData);
      }
      loadNurses();
      resetForm();
    } catch (error) {
      console.error('Error saving nurse:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this nurse?')) {
      try {
        await adminService.deleteNurse(id);
        loadNurses();
      } catch (error) {
        console.error('Error deleting nurse:', error);
      }
    }
  };

  const handleEdit = (nurse) => {
    setFormData({
      empid: nurse.EMPID,
      fname: nurse.FNAME,
      mname: nurse.MNAME || '',
      lname: nurse.LNAME || '',
      gender: nurse.GENDER,
      deptid: nurse.DEPTID,
      email: nurse.EMAIL || '',
      date_of_birth: nurse.DATE_OF_BIRTH ? nurse.DATE_OF_BIRTH.split('T')[0] : '',
      street: nurse.STREET || '',
      city: nurse.CITY || '',
      state: nurse.STATE || '',
      Hno: nurse.HNO || '',
      countpatient: nurse.COUNTPATIENT || '0'
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
      Hno: '',
      countpatient: ''
    });
    setIsEditing(false);
  };

  return (
    <div className="manage-page">
      <h1>Manage Nurses</h1>
      
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
        <input
          type="number"
          placeholder="Patient Count"
          value={formData.countpatient}
          onChange={(e) => setFormData({...formData, countpatient: e.target.value})}
          required
        />
        
        <button type="submit">{isEditing ? 'Update' : 'Add'} Nurse</button>
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
              <th>Patient Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {nurses.map(nurse => (
              <tr key={nurse.EMPID}>
                <td>{nurse.EMPID}</td>
                <td>{`${nurse.FNAME} ${nurse.MNAME || ''} ${nurse.LNAME || ''}`}</td>
                <td>{nurse.DEPTID}</td>
                <td>{nurse.EMAIL}</td>
                <td>{nurse.COUNTPATIENT || '0'}</td>
                <td>
                  <button onClick={() => handleEdit(nurse)}>Edit</button>
                  <button onClick={() => handleDelete(nurse.EMPID)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageNurses; 