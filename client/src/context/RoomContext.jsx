import React, { createContext, useContext, useState, useEffect } from 'react';
import { joinRoom as joinRoomAPI, getRoomById } from '../api/RoomApi';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [room, setRoom] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial state from localStorage (optional, for persistence)
  useEffect(() => {
    const storedRoom = localStorage.getItem('currentMultiplayerRoom');
    const storedParticipant = localStorage.getItem('currentRoomParticipant');
    
    if (storedRoom) setRoom(JSON.parse(storedRoom));
    if (storedParticipant) setParticipant(JSON.parse(storedParticipant));
  }, []);

  // Sync localStorage when state changes
  useEffect(() => {
    if (room) localStorage.setItem('currentMultiplayerRoom', JSON.stringify(room));
    if (participant) localStorage.setItem('currentRoomParticipant', JSON.stringify(participant));
  }, [room, participant]);

  const joinRoom = async (roomId, token) => {
    setLoading(true);
    setError(null);
    try {
      // Check what the joinRoom API actually returns
      const joinData = await joinRoomAPI(roomId, token);
      console.log('Join room API response:', joinData);
      
      // If joinRoom returns room and participant separately
      if (joinData.room && joinData.participant) {
        setRoom(joinData.room);
        setParticipant(joinData.participant);
        return joinData;
      }
      
      // If joinRoom only returns participant info, fetch room separately
      if (joinData.participant || joinData._id) {
        // Set participant from join response
        setParticipant(joinData.participant || joinData);
        
        // Fetch full room data
        const roomData = await getRoomById(roomId);
        console.log('Room data fetched:', roomData);
        setRoom(roomData);
        
        return { room: roomData, participant: joinData.participant || joinData };
      }
      
      // Fallback: treat the response as room data
      setRoom(joinData);
      return { room: joinData, participant: null };
      
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add method to update room data
  const updateRoomData = (newRoomData) => {
    setRoom(newRoomData);
  };

  // Add method to update participant data
  const updateParticipantData = (newParticipantData) => {
    setParticipant(newParticipantData);
  };

  const leaveRoom = () => {
    setRoom(null);
    setParticipant(null);
    localStorage.removeItem('currentMultiplayerRoom');
    localStorage.removeItem('currentRoomParticipant');
  };

  return (
    <RoomContext.Provider
      value={{
        room,
        participant,
        loading,
        error,
        joinRoom,
        leaveRoom,
        updateRoomData,
        updateParticipantData,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext(RoomContext);