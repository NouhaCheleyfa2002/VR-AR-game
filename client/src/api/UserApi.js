import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;


// User management API calls
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${backendUrl}/users`);
    
    const data = response.data.data || [];
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${backendUrl}/users/${id}`);
    
    return response.data.data || {};
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getUserScore = async (id) => {
  try {
    const response = await axios.get(`${backendUrl}/users/${id}/score`);
    
    return response.data.data || {};
  } catch (error) {
    console.error('Error fetching user score:', error);
    throw error;
  }
};

export const getUserGameplayHistory = async (id) => {
  try {
    const response = await axios.get(`${backendUrl}/users/${id}/gameplay-history`);
    
    const data = response.data.data || [];
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching user gameplay history:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${backendUrl}/users`, userData);
    
    return response.data.data || {};
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`${backendUrl}/users/${id}`, userData);
    
    return response.data.data || {};
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/users/${id}`);
    
    return response.data.data || {};
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};