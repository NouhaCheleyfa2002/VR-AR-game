import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// GET all hints
export const getAllHints = async () => {
  try {
    const response = await axios.get(`${backendUrl}/hints`);
    const data = response.data.data || response.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching hints:', error);
    return [];
  }
};

// GET hint by ID
export const getHintById = async (id) => {
  try {
    const response = await axios.get(`${backendUrl}/hints/${id}`);
    return response.data.data || response.data || null;
  } catch (error) {
    console.error('Error fetching hint by ID:', error);
    throw error;
  }
};

// GET hints by puzzle ID
export const getHintsByPuzzleId = async (puzzleId) => {
  try {
    const response = await axios.get(`${backendUrl}/hints/puzzle/${puzzleId}`);
    const data = response.data.data || response.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching hints by puzzle ID:', error);
    return [];
  }
};

// POST create a hint
export const createHint = async (data) => {
  try {
    const response = await axios.post(`${backendUrl}/hints`, data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating hint:', error);
    throw error;
  }
};

// PUT update a hint
export const updateHint = async (id, data) => {
  try {
    const response = await axios.put(`${backendUrl}/hints/${id}`, data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error updating hint:', error);
    throw error;
  }
};

// DELETE a hint
export const deleteHint = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/hints/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error deleting hint:', error);
    throw error;
  }
};