import axios from 'axios';

const backendUrl = `${import.meta.env.VITE_BACKEND_URL}/api/scenarios`;

export const getAllScenarios = async () => {
  return await axios.get(backendUrl);
};

export const getScenarioById = async (id) => {
  return await axios.get(`${backendUrl}/${id}`);
};

export const getScenariosByGameId = async (gameId) => {
  return await axios.get(`${backendUrl}/game/${gameId}`);
};

export const createScenario = async (data) => {
  return await axios.post(backendUrl, data);
};

export const updateScenario = async (id, data) => {
  return await axios.put(`${backendUrl}/${id}`, data);
};

export const deleteScenario = async (id) => {
  return await axios.delete(`${backendUrl}/${id}`);
};
