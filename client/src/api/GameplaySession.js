import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;



export const getAllSessions = async () => {
  try {
    const response = await axios.get(`${backendUrl}/sessions`);
    
    const data = response.data.data || response.data || [];
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
};

// Get session by ID
export const getSessionById = async (id) => {
  try {
    const response = await axios.get(`${backendUrl}/sessions/${id}`);
    return response.data.data || response.data || null;
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
};

// Get sessions by player ID
export const getSessionsByPlayerId = async (playerId) => {
  try {
    const response = await axios.get(`${backendUrl}/sessions/player/${playerId}`);
    
    const data = response.data.data || response.data || [];
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching sessions by player:', error);
    return [];
  }
};

// Get sessions by room ID
export const getSessionsByRoomId = async (roomId) => {
  try {
    const response = await axios.get(`${backendUrl}/sessions/room/${roomId}`);

    const data = response.data.data || response.data || [];
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching sessions by room:', error);
    return [];
  }
};

// Create a new session
export const createSession = async (sessionData) => {
  try {
    const response = await axios.post(`${backendUrl}/sessions`, sessionData);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

// Update session (admin only)
export const updateSession = async (id, sessionData) => {
  try {
    const response = await axios.put(`${backendUrl}/sessions/${id}`, sessionData);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
};

// Delete session (admin only)
export const deleteSession = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/sessions/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};


