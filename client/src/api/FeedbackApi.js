// src/api/feedbackApi.js
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Get all feedbacks (public)
export const getAllFeedbacks = async () => {
  try {
    const response = await axios.get(`${backendUrl}/feedbacks`);
    const data = response.data.data || response.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return [];
  }
};

// Get feedback by id (admin only)
export const getFeedbackById = async (id, token) => {
  try {
    const response = await axios.get(`${backendUrl}/feedbacks/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data || response.data || null;
  } catch (error) {
    console.error('Error fetching feedback by id:', error);
    throw error;
  }
};

// Get feedbacks by player (admin only)
export const getFeedbacksByPlayer = async (playerId, token) => {
  try {
    const response = await axios.get(`${backendUrl}/feedbacks/player/${playerId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = response.data.data || response.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching feedbacks by player:', error);
    return [];
  }
};

// Create new feedback (public or authenticated depending on backend)
export const createFeedback = async (feedbackData, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.post(`${backendUrl}/feedbacks`, feedbackData, config);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw error;
  }
};

// Update feedback by id
export const updateFeedback = async (id, feedbackData, token) => {
  try {
    const response = await axios.put(`${backendUrl}/feedbacks/${id}`, feedbackData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }
};

// Delete feedback by id
export const deleteFeedback = async (id, token) => {
  try {
    const response = await axios.delete(`${backendUrl}/feedbacks/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
};
