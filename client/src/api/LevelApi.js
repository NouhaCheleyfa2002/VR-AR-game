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
    console.log('🚀 API: Sending level data:', JSON.stringify(data, null, 2));
    
    const response = await axios.post(`${backendUrl}/levels`, data);
    
    console.log('✅ API: Level created successfully:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    // CRITICAL: Log the actual backend error response
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Backend Error Response:', error.response?.data);
    console.error('❌ Error Message from Backend:', error.response?.data?.message);
    console.error('❌ Validation Errors:', error.response?.data?.errors);
    
    // Also log request details
    console.error('📤 Request URL:', error.config?.url);
    console.error('📤 Request Headers:', error.config?.headers);
    console.error('📤 Request Data:', JSON.parse(error.config?.data || '{}'));
    
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