import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const getAllScenarios = async () => {
  try {
    const response = await axios.get(`${backendUrl}/scenarios`);

    const data = response.data.data || response.data || null;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return [];
  }
};

export const getScenarioById = async (id) => {
  try {
   const response = await axios.get(`${backendUrl}/scenarios/${id}`);
   const data = response.data.data || response.data || null;
   return data;
 } catch (error) {
   console.error('Error fetching scenarios:', error);
   return [];
 }
};

export const getScenariosByGameId = async (gameId) => {
  try {
    const response = await axios.get(`${backendUrl}/scenarios/game/${gameId}`);
    const data = response.data.data || response.data || null;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return [];
  }
};

export const createScenario = async (data) => {
  try {
    const response = await axios.post(`${backendUrl}/scenarios`, data);
   
    const resdata = response.data.data || response.data || null;

    return Array.isArray(resdata) ? resdata : [];
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return [];
  }
};

export const updateScenario = async (id, data) => {
    try {
    const response =  await axios.put(`${backendUrl}/scenarios/${id}`, data);
    
    const resdata = response.data.data || response.data || null;
    
    return Array.isArray(resdata) ? resdata : [];
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return [];
  }
};

export const deleteScenario = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/scenarios/${id}`);
    const data = response.data.data || response.data || null;
  return Array.isArray(data) ? data : [];
} catch (error) {
  console.error('Error fetching scenarios:', error);
  return [];
}
};
