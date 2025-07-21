import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const getAllEscapeGames = async () => {
  try {
    const response = await axios.get(`${backendUrl}/escape-games`);
    
    const data = response.data.data || [];
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching escape games:', error);
    return []; 
  }
};

export const getEscapeGameById = async (id) => {
  try {
    const response = await axios.get(`${backendUrl}/escape-games/${id}`);

    const data = response.data.data || [];
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching escape game:', error);
    throw error;
  }
};

export const createEscapeGame = async (data) => {
  try {
    const response = await axios.post(`${backendUrl}/escape-games`, data);

    const resdata = response.data.data || [];
    
    return Array.isArray(resdata) ? resdata : [];
  } catch (error) {
    console.error('Error creating escape game:', error);
    throw error;
  }
};

export const updateEscapeGame = async (id, data) => {
  try {
    const response = await axios.put(`${backendUrl}/escape-games/${id}`, data);
    const resdata = response.data.data || [];
    
    return Array.isArray(resdata) ? resdata : [];
  } catch (error) {
    console.error('Error updating escape game:', error);
    throw error;
  }
};

export const deleteEscapeGame = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/escape-games/${id}`);
    const data = response.data.data || [];
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error deleting escape game:', error);
    throw error;
  }
};

export const toggleEscapeGameActive = async (id) => {
  try {
    const response = await axios.patch(`${backendUrl}/escape-games/${id}/toggle-active`);
    const data = response.data.data || [];
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error toggling escape game status:', error);
    throw error;
  }
};