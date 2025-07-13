import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;


export const getAllPuzzles = async () => {
  try {
    const response = await axios.get(`${backendUrl}/puzzles`);
    const data = response.data.data || response.data || [];
  
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching puzzles:', error);
    return []; 
  }
};

export const getPuzzleById = async (id) => {
  try {
    const response = await axios.get(`${backendUrl}/puzzles/${id}`);
    return response.data.data || response.data || null;
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    throw error;
  }
};

export const getPuzzlesByLevelId = async (levelId) => {
  try {
    const response = await axios.get(`${backendUrl}/puzzles/level/${levelId}`);
    
    const data = response.data.data || response.data || []; 
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching puzzles by level:', error);
    return [];
  }
};

export const createPuzzle = async (data) => {
  try {
    const response = await axios.post(`${backendUrl}/puzzles`, data
    );
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating puzzle:', error);
    throw error;
  }
};

export const updatePuzzle = async (id, data) => {
  try {
    const response = await axios.put(`${backendUrl}/puzzles/${id}`, data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error updating puzzle:', error);
    throw error;
  }
};

export const deletePuzzle = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/puzzles/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error deleting puzzle:', error);
    throw error;
  }
};

