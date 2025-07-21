import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// GET all rooms (admin only)
export const getAllRooms = async () => {
  try {
    const response = await axios.get(`${backendUrl}/rooms`);
    const data = response.data.data || response.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
};

// GET room by ID
export const getRoomById = async (id) => {
  try {
    const response = await axios.get(`${backendUrl}/rooms/${id}`);
    const data = response.data.data || response.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching room by ID:', error);
    throw error;
  }
};

// GET room by code (e.g., when scanning QR)
export const getRoomByCode = async (code) => {
  try {
    const response = await axios.get(`${backendUrl}/rooms/code/${code}`);
    const data = response.data.data || response.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching room by code:', error);
    throw error;
  }
};


// join a room
export const joinRoom = async (roomId, token) => {
  try {
    
    const response = await axios.post(
      `${backendUrl}/rooms/${roomId}/join`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data.data; // { participant, room }

  } catch (error) {
    console.error('Error joining room:', error?.response?.data || error.message);
    throw error;
  }
};

// POST create a room
export const createRoom = async (data) => {
  try {
    const response = await axios.post(`${backendUrl}/rooms`, data);
    const resdata = response.data.data || response.data || [];
    return Array.isArray(resdata) ? resdata : [];
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

// PUT update a room
export const updateRoom = async (id, data) => {
  try {
    const response = await axios.put(`${backendUrl}/rooms/${id}`, data);
    const resdata = response.data.data || response.data || [];
    return Array.isArray(resdata) ? resdata : [];
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

// DELETE a room
export const deleteRoom = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/rooms/${id}`);
    const resdata = response.data.data || response.data || [];
    return Array.isArray(resdata) ? resdata : [];
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};
