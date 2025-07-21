import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// GET all participants (admin only)
export const getAllParticipants = async () => {
  try {
    const response = await axios.get(`${backendUrl}/participants`);
    const data = response.data.data;
    console.log("data", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching participants:', error);
    return [];
  }
};

// GET participant by ID
export const getParticipantById = async (id) => {
  try {
    const response = await axios.get(`${backendUrl}/participants/${id}`);
    return response.data.data || response.data || null;
  } catch (error) {
    console.error('Error fetching participant by ID:', error);
    throw error;
  }
};

// GET participants by room ID
export const getParticipantsByRoomId = async (roomId) => {
  try {
    const response = await axios.get(`${backendUrl}/participants/room/${roomId}`);
    const data = response.data.data || response.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching participants by room ID:', error);
    return [];
  }
};

// GET participants by player ID
export const getParticipantsByPlayerId = async (playerId) => {
  try {
    const response = await axios.get(`${backendUrl}/participants/player/${playerId}`);
    const data = response.data.data;
    console.log("data", data);
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching participants by player ID:', error);
    return [];
  }
};

// POST create a participant
export const createParticipant = async (data) => {
  try {
    const response = await axios.post(`${backendUrl}/participants`, data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating participant:', error);
    throw error;
  }
};

// PUT update a participant
export const updateParticipant = async (id, data) => {
  try {
    const response = await axios.put(`${backendUrl}/participants/${id}`, data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error updating participant:', error);
    throw error;
  }
};

// DELETE a participant
export const deleteParticipant = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/participants/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error deleting participant:', error);
    throw error;
  }
};