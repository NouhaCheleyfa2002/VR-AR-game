import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// GET all participants (admin only)
export const getAllParticipants = async () => {
  try {
    const response = await axios.get(`${backendUrl}/room-participant`);
    return response.data.data || response.data || null;
  } catch (error) {
    console.error('Error fetching participants:', error);
    return [];
  }
};

// GET participant by ID
export const getParticipantById = async (id) => {
  try {
    const response = await axios.get(`${backendUrl}/room-participant/${id}`);
    return response.data.data || response.data || null;
  } catch (error) {
    console.error('Error fetching participant by ID:', error);
    throw error;
  }
};

// GET participants by room ID
export const getParticipantsByRoomId = async (roomId) => {
  try {
    const response = await axios.get(`${backendUrl}/room-participant/room/${roomId}`);
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
    const response = await axios.get(`${backendUrl}/room-participant/player/${playerId}`);
    const data = response.data.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching participants by player ID:', error);
    return [];
  }
};


export const toggleParticipantReady = async (id) => {
  try {
    const response = await axios.patch(`${backendUrl}/room-participant/${id}/toggle-ready`);
   
    return response.data;
  } catch (error) {
    console.error('Error toggling participant ready status:', error);
    throw error;
  }
};

// PATCH set specific ready status
export const setParticipantReadyStatus = async (id, isReady) => {
  try {
    const response = await axios.patch(`${backendUrl}/room-participant/${id}/ready-status`, {
      isReady
    });
    return response.data;
  } catch (error) {
    console.error('Error setting participant ready status:', error);
    throw error;
  }
};

// POST create a participant
export const createParticipant = async (data) => {
  try {
    const response = await axios.post(`${backendUrl}/room-participant`, data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating participant:', error);
    throw error;
  }
};

// PUT update a participant
export const updateParticipant = async (id, data) => {
  try {
    const response = await axios.put(`${backendUrl}/room-participant/${id}`, data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error updating participant:', error);
    throw error;
  }
};

// DELETE a participant
export const deleteParticipant = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/room-participant/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error deleting participant:', error);
    throw error;
  }
};