import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const getAllRooms = async () => {
  try {
    const response = await axios.get(`${backendUrl}/rooms`);
    const data = response.data.data || response.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
};


export const getRoomById = async (id) => {
  try {
    const response = await axios.get(`${backendUrl}/rooms/${id}`);
    // Return the actual room object, not force it to be an array
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching room by ID:', error);
    throw error;
  }
};


export const getRoomBygameId = async (gameId) => {
  try {
    const response = await axios.get(`${backendUrl}/rooms/${gameId}`);
    // Return the actual room object, not force it to be an array
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching room by game ID:', error);
    throw error;
  }
};


export const getRoomByCode = async (code, token) => {
  try {
    const response = await axios.get(`${backendUrl}/rooms/code/${code}`, {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
     });
    
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching room by code:', error);
    throw error;
  }
};  

export const joinRoomByCode = async (code, token) => {
   try {
    const response = await axios.post(
        `${backendUrl}/rooms/code/${code}/join`,
         {},
         {
           headers: {
             Authorization: `Bearer ${token}`
           }
        }
       );
      return response.data.data;
     } catch (error) {
       console.error('Error joining room by code:', error?.response?.data || error.message);
       throw error;
     }
    };


export const joinRoom = async (roomId) => {
  try {
    const response = await axios.post(
      `${backendUrl}/rooms/${roomId}/join`
    );

    return response.data.data; 
  
  } catch (error) {
    console.error('Error joining room:', error?.response?.data || error.message);
    throw error;
  }
};

export const createRoom = async (data) => {
  try {
    const response = await axios.post(`${backendUrl}/rooms`, data);
    // Return the actual room object, not force it to be an array
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

export const updateRoom = async (roomId, data) => {
  try {
    console.log('🚀 Updating room:', roomId);
    console.log('📤 Update data:', JSON.stringify(data, null, 2));
    
    const response = await axios.put(`${backendUrl}/rooms/${roomId}`, data);
    
    console.log('✅ Room updated successfully:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    // Enhanced error logging
    console.error('❌ Error updating room:');
    console.error('📍 Room ID:', roomId);
    console.error('📤 Data sent:', JSON.stringify(data, null, 2));
    console.error('🔢 Status:', error.response?.status);
    console.error('💬 Status Text:', error.response?.statusText);
    console.error('🔗 URL:', error.config?.url);
    console.error('📋 Backend Response:', error.response?.data);
    
    if (error.response?.data?.message) {
      console.error('💡 Backend Message:', error.response.data.message);
    }
    
    if (error.response?.data?.errors) {
      console.error('❗ Validation Errors:', error.response.data.errors);
    }
    
    throw error;
  }
};

export const deleteRoom = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/rooms/${id}`);
    const resdata = response.data.data || response.data || [];
    return Array.isArray(resdata) ? resdata : [];
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};