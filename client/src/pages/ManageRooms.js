import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import './ManagePages.css';

function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [roomCosts, setRoomCosts] = useState([]);
  const [formData, setFormData] = useState({
    rid: '',
    roomtype: '',
    rcost: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadRooms();
    loadRoomCosts();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await adminService.getRooms();
      setRooms(response.data);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const loadRoomCosts = async () => {
    try {
      const response = await adminService.getRoomCosts();
      setRoomCosts(response.data);
    } catch (error) {
      console.error('Error loading room costs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await adminService.updateRoom(formData.rid, formData);
        // Update room cost separately
        await adminService.updateRoomCost(formData.roomtype, { rcost: formData.rcost });
      } else {
        await adminService.addRoom(formData);
        // Add room cost separately
        await adminService.addRoomCost({
          roomtype: formData.roomtype,
          rcost: formData.rcost
        });
      }
      loadRooms();
      loadRoomCosts();
      resetForm();
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  const handleDelete = async (id, roomtype) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await adminService.deleteRoom(id);
        // Check if this is the last room of this type before deleting the cost
        const roomsOfType = rooms.filter(room => room.roomtype === roomtype);
        if (roomsOfType.length === 1) {
          await adminService.deleteRoomCost(roomtype);
        }
        loadRooms();
        loadRoomCosts();
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  const handleEdit = (room) => {
    setFormData({
      rid: room.RID,
      roomtype: room.ROOMTYPE,
      rcost: room.RCOST || ''
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      rid: '',
      roomtype: '',
      rcost: ''
    });
    setIsEditing(false);
  };

  const getRoomCost = (roomtype) => {
    const roomCost = roomCosts.find(rc => rc.roomtype === roomtype);
    return roomCost ? roomCost.rcost : 'N/A';
  };

  return (
    <div className="manage-page">
      <h1>Manage Rooms</h1>
      
      <form onSubmit={handleSubmit} className="manage-form">
        <input
          type="number"
          placeholder="Room ID"
          value={formData.rid}
          onChange={(e) => setFormData({...formData, rid: e.target.value})}
          required
          disabled={isEditing}
        />
        <select
          value={formData.roomtype}
          onChange={(e) => setFormData({...formData, roomtype: e.target.value})}
          required
        >
          <option value="">Select Room Type</option>
          <option value="General">General</option>
          <option value="Semi-Private">Semi-Private</option>
          <option value="Private">Private</option>
          <option value="ICU">ICU</option>
          <option value="Operation Theater">Operation Theater</option>
        </select>
        <input
          type="number"
          placeholder="Room Cost"
          value={formData.rcost}
          onChange={(e) => setFormData({...formData, rcost: e.target.value})}
          required
        />
        
        <button type="submit">{isEditing ? 'Update' : 'Add'} Room</button>
        {isEditing && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Room ID</th>
              <th>Room Type</th>
              <th>Cost per Day</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => {
              console.log('Room row:', room); // Debug log
              return (
                <tr key={room.RID}>
                  <td>{room.RID}</td>
                  <td>{room.ROOMTYPE}</td>
                  <td>{room.RCOST || 'Not Set'}</td>
                  <td>
                    <button onClick={() => handleEdit(room)}>Edit</button>
                    <button onClick={() => handleDelete(room.RID, room.ROOMTYPE)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageRooms; 