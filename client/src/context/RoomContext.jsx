import React, { createContext, useContext, useState, useEffect } from 'react';

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
    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      
      setRoom(data.room);
      setParticipant(data.participant);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
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
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext(RoomContext);