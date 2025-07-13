// pages/JoinRoomPage.jsx
import React, { useState , useEffect} from 'react';
import { Typography, Box, Container } from '@mui/material';
import QRCodeScanner from '../../components/QR/QRodeScanner';
import { useNavigate } from 'react-router-dom';

const JoinRoomPage = () => {
  const [codes, setCodes] = useState([
    {
      codeId: 101,
      roomId: 1,
      gameId: 10,
      culturalElementId: 5,
      content: 'Join Room 1 – Andalusian Tower',
      maxScans: 3,
      scans: 1,
      expirationTime: '2025-07-04T23:00:00Z',
    },
    {
      codeId: 102,
      roomId: 2,
      gameId: 11,
      culturalElementId: 8,
      content: 'Join Room 2 – Roman Mosaic',
      maxScans: 5,
      scans: 5,
      expirationTime: '2025-07-03T20:00:00Z',
    },
  ]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const multiplayerRooms = [
      {
        roomId: 1,
        gameId: 101,
        maxPlayer: 4,
        hostPlayer: 999,
        roomStatus: 'Waiting',
        accessCode: 'XYZ123',
        qrCodeGenerated: true,
        participants: [
          {
            participantId: 1001,
            roomId: 1,
            playerId: 123,
            joinedAt: new Date(Date.now() - 60000).toISOString(),
            isReady: true,
          },
          {
            participantId: 1002,
            roomId: 1,
            playerId: 456,
            joinedAt: new Date(Date.now() - 30000).toISOString(),
            isReady: false,
          },
        ],
      },
    ];

    // Only seed if not already present
    if (!localStorage.getItem('multiplayerRooms')) {
      localStorage.setItem('multiplayerRooms', JSON.stringify(multiplayerRooms));
    }
  }, []);

  const handleJoinRoom = (updatedCode) => {
    const allRooms = JSON.parse(localStorage.getItem('multiplayerRooms')) || [];
  
    const room = allRooms.find(r => r.roomId === updatedCode.roomId);
  
    if (!room) {
      console.error("Room not found");
      return;
    }
  
    // Simulate new participant (current user)
    const participantId = Math.floor(Math.random() * 10000);
    const newParticipant = {
      participantId,
      roomId: room.roomId,
      playerId: 999, // current player ID
      joinedAt: new Date().toISOString(),
      isReady: false,
    };
  
    // Update room participants
    room.participants.push(newParticipant);
  
    // Update allRooms and save
    const updatedRooms = allRooms.map(r =>
      r.roomId === room.roomId ? room : r
    );
    localStorage.setItem('multiplayerRooms', JSON.stringify(updatedRooms));
  
    // Save to current session keys
    localStorage.setItem('currentMultiplayerRoom', JSON.stringify(room));
    localStorage.setItem('currentRoomParticipant', JSON.stringify(newParticipant));
  
    navigate(`/player/room/${room.roomId}`);
  };
  


  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Join a Multiplayer Room
        </Typography>
        <QRCodeScanner qrCodes={codes} onJoinRoom={handleJoinRoom} />
      </Box>
    </Container>
  );
};

export default JoinRoomPage;
