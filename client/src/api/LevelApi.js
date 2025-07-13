import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;


export const getAllLevels = async () => {
  try {
    const response = await axios.get(`${backendUrl}/levels`);
    
    const data = response.data.data || response.data || [];
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching levels:', error);
    return [];
  }
};

export const getLevelById = async (id) => {
  try {
    const response = await axios.get(`${backendUrl}/levels/${id}`);
    return response.data.data || response.data || null;
  } catch (error) {
    console.error('Error fetching level:', error);
    throw error;
  }
};

export const getLevelsByScenarioId = async (scenarioId) => {
  try {
    const response = await axios.get(`${backendUrl}/levels/scenario/${scenarioId}`);
    
    const data = response.data.data || response.data || [];
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching levels by scenario:', error);
    return [];
  }
};

export const createLevel = async (data) => {
  try {
    const response = await axios.post(`${backendUrl}/levels`, data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating level:', error);
    throw error;
  }
};

export const updateLevel = async (id, data) => {
  try {
    const response = await axios.put(`${backendUrl}/levels/${id}`, data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error updating level:', error);
    throw error;
  }
};

export const deleteLevel = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/levels/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error deleting level:', error);
    throw error;
  }
};