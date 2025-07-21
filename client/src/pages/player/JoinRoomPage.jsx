import { useRoom } from '../../context/RoomContext';
import React, {  useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const JoinRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const { joinRoom, loading, error } = useRoom();

  useEffect(() => {
    if (token && roomId) {
      joinRoom(roomId, token)
        .then(() => navigate(`/player/rooms/${roomId}`))
        .catch(() => navigate('/player'));
    }
  }, [roomId, token]);

  return (
    <div>
      {loading && <p>Joining room...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default JoinRoomPage;