import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import './ManagePages.css';

function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    deptid: '',
    dname: '',
    dept_headid: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await adminService.getDepartments();
      console.log('Departments loaded:', response.data);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await adminService.updateDepartment(formData.deptid, formData);
      } else {
        await adminService.addDepartment(formData);
      }
      loadDepartments();
      resetForm();
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await adminService.deleteDepartment(parseInt(id));
        loadDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const handleEdit = (department) => {
    setFormData({
      deptid: department.DEPTID,
      dname: department.DNAME,
      dept_headid: department.DEPT_HEADID || ''
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      deptid: '',
      dname: '',
      dept_headid: ''
    });
    setIsEditing(false);
  };

  return (
    <div className="manage-page">
      <h1>Manage Departments</h1>
      
      <form onSubmit={handleSubmit} className="manage-form">
        <input
          type="number"
          placeholder="Department ID"
          value={formData.deptid}
          onChange={(e) => setFormData({...formData, deptid: e.target.value})}
          required
          disabled={isEditing}
        />
        <input
          type="text"
          placeholder="Department Name"
          value={formData.dname}
          onChange={(e) => setFormData({...formData, dname: e.target.value})}
          required
        />
        <input
          type="number"
          placeholder="Department Head ID"
          value={formData.dept_headid}
          onChange={(e) => setFormData({...formData, dept_headid: e.target.value})}
        />
        
        <button type="submit">{isEditing ? 'Update' : 'Add'} Department</button>
        {isEditing && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Head Doctor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(department => (
              <tr key={department.DEPTID || department.deptid}>
                <td>{department.DEPTID || department.deptid}</td>
                <td>{department.DNAME || department.dname}</td>
                <td>
                  {department.DEPT_HEADID || department.dept_headid ? 
                    `ID: ${department.DEPT_HEADID || department.dept_headid}` : ''}
                </td>
                <td>
                  <button onClick={() => handleEdit(department)}>Edit</button>
                  <button onClick={() => handleDelete(department.DEPTID || department.deptid)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageDepartments; 