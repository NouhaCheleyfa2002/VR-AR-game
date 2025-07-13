import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// GET all invitations filtered by type
export const getAllInvitations = async (type = '') => {
    try {
      const query = type ? `?type=${type}` : '';
      const response = await axios.get(`${backendUrl}/invitations${query}`);
    const data = response.data.data || response.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return [];
  }
};

// GET invitation by ID
export const getInvitationById = async (id) => {
  try {
    const response = await axios.get(`${backendUrl}/invitations/${id}`);
    return response.data.data || response.data || null;
  } catch (error) {
    console.error('Error fetching invitation by ID:', error);
    throw error;
  }
};

// GET invitations by sender ID
export const getInvitationsBySenderId = async (senderId) => {
  try {
    const response = await axios.get(`${backendUrl}/invitations/sender/${senderId}`);
    const data = response.data.data || response.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching invitations by sender ID:', error);
    return [];
  }
};

// GET invitations by status
export const getInvitationsByStatus = async (status) => {
  try {
    const response = await axios.get(`${backendUrl}/invitations/status/${status}`);
    const data = response.data.data || response.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching invitations by status:', error);
    return [];
  }
};

// POST create an invitation
export const createInvitation = async (data) => {
  try {
    const response = await axios.post(`${backendUrl}/invitations`, data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw error;
  }
};

// PUT update an invitation
export const updateInvitation = async (id, data) => {
  try {
    const response = await axios.put(`${backendUrl}/invitations/${id}`, data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error updating invitation:', error);
    throw error;
  }
};


// DELETE an invitation
export const deleteInvitation = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/invitations/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error deleting invitation:', error);
    throw error;
  }
};

