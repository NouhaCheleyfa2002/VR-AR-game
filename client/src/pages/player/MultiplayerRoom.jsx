import React, { useEffect, useState } from 'react';
import MultiplayerRoomCard from '../../components/rooms/MultiplayerRoomCard';
import ParticipantList from '../../components/roomParticipant/PaticipantList';
import { 
  Typography, 
  Container, 
  CircularProgress, 
  Alert, 
  Snackbar, 
  Button, 
  Box 
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getRoomById,
  getRoomByCode,
  updateRoom,
} from '../../api/RoomApi'; // Adjust the import path as needed

const PlayerRoomPage = () => {
  const [room, setRoom] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [pollingInterval, setPollingInterval] = useState(null);
  const navigate = useNavigate();
  const { roomId, roomCode } = useParams(); // Assuming you'll pass room info via URL params

  useEffect(() => {
    initializeRoom();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchRoomData, 5000); // Poll every 5 seconds
    setPollingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [roomId, roomCode]);

  const initializeRoom = async () => {
    try {
      setLoading(true);
      
      // Get stored participant info
      const storedParticipant = JSON.parse(localStorage.getItem('currentRoomParticipant'));
      
      if (!storedParticipant) {
        setSnackbar({
          open: true,
          message: 'No participant session found. Please join a room first.',
          severity: 'error'
        });
        navigate('/player/join-room');
        return;
      }

      // Fetch room data from API
      let roomData;
      if (roomId) {
        roomData = await getRoomById(roomId);
      } else if (roomCode) {
        roomData = await getRoomByCode(roomCode);
      } else {
        // Try to get room info from stored participant
        const storedRoom = JSON.parse(localStorage.getItem('currentMultiplayerRoom'));
        if (storedRoom?.roomId) {
          roomData = await getRoomById(storedRoom.roomId);
        }
      }

      if (!roomData) {
        setSnackbar({
          open: true,
          message: 'Room not found or no longer exists.',
          severity: 'error'
        });
        navigate('/player/join-room');
        return;
      }

      // Verify participant is still in the room
      const currentParticipant = roomData.participants?.find(
        p => p.participantId === storedParticipant.participantId
      );

      if (!currentParticipant) {
        setSnackbar({
          open: true,
          message: 'You are no longer in this room.',
          severity: 'error'
        });
        localStorage.removeItem('currentMultiplayerRoom');
        localStorage.removeItem('currentRoomParticipant');
        navigate('/player/join-room');
        return;
      }

      // Update localStorage with fresh data
      localStorage.setItem('currentMultiplayerRoom', JSON.stringify(roomData));
      localStorage.setItem('currentRoomParticipant', JSON.stringify(currentParticipant));

      setRoom(roomData);
      setParticipant(currentParticipant);
      setSnackbar({
        open: true,
        message: 'Room loaded successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error initializing room:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load room data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomData = async () => {
    if (!room) return;

    try {
      const roomData = await getRoomById(room.roomId);
      
      if (!roomData) {
        setSnackbar({
          open: true,
          message: 'Room no longer exists',
          severity: 'error'
        });
        handleLeaveRoom();
        return;
      }

      // Check if participant is still in the room
      const currentParticipant = roomData.participants?.find(
        p => p.participantId === participant.participantId
      );

      if (!currentParticipant) {
        setSnackbar({
          open: true,
          message: 'You have been removed from the room',
          severity: 'warning'
        });
        handleLeaveRoom();
        return;
      }

      // Update state only if there are changes
      if (JSON.stringify(room) !== JSON.stringify(roomData)) {
        setRoom(roomData);
        setParticipant(currentParticipant);
        
        // Update localStorage
        localStorage.setItem('currentMultiplayerRoom', JSON.stringify(roomData));
        localStorage.setItem('currentRoomParticipant', JSON.stringify(currentParticipant));
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
      // Don't show error for polling failures to avoid spam
    }
  };

  const handleReadyToggle = async (updatedParticipant) => {
    if (updating) return;

    try {
      setUpdating(true);

      // Update participant's ready status
      const updatedParticipants = room.participants.map((p) =>
        p.participantId === updatedParticipant.participantId
          ? { ...p, isReady: updatedParticipant.isReady }
          : p
      );

      const updatedRoomData = { 
        ...room, 
        participants: updatedParticipants 
      };

      // Update room via API
      await updateRoom(room.roomId, updatedRoomData);

      // Update local state
      const updatedSelf = updatedParticipants.find(
        (p) => p.participantId === participant.participantId
      );

      setRoom(updatedRoomData);
      setParticipant(updatedSelf);

      // Update localStorage
      localStorage.setItem('currentMultiplayerRoom', JSON.stringify(updatedRoomData));
      localStorage.setItem('currentRoomParticipant', JSON.stringify(updatedSelf));

      setSnackbar({
        open: true,
        message: updatedParticipant.isReady ? 'Marked as ready' : 'Marked as not ready',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating ready status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update ready status',
        severity: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleLeaveRoom = () => {
    // Clear polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Clear localStorage
    localStorage.removeItem('currentMultiplayerRoom');
    localStorage.removeItem('currentRoomParticipant');

    // Navigate back
    navigate('/player/join-room');
  };

  const handleStartGame = async () => {
    if (!allReady) return;

    try {
      setUpdating(true);

      // Update room status to Active
      const updatedRoomData = { 
        ...room, 
        roomStatus: 'Active'
      };

      await updateRoom(room.roomId, updatedRoomData);
      
      setSnackbar({
        open: true,
        message: 'Game started!',
        severity: 'success'
      });

      // Navigate to game or implement game logic
      // navigate('/game', { state: { room: updatedRoomData, participant } });
      console.log('Start game logic - Room:', updatedRoomData);
    } catch (error) {
      console.error('Error starting game:', error);
      setSnackbar({
        open: true,
        message: 'Failed to start game',
        severity: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container sx={{ mt: 6, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading room...
        </Typography>
      </Container>
    );
  }

  if (!room || !participant) {
    return (
      <Container sx={{ mt: 6 }}>
        <Typography variant="h6" color="text.secondary">
          No room session found. Please scan a QR code to join.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/player/join-room')}
          sx={{ mt: 2 }}
        >
          Join Room
        </Button>
      </Container>
    );
  }

  const allReady = room.participants?.every((p) => p.isReady) || false;

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          Multiplayer Room
        </Typography>
        <Button
          color="error"
          variant="outlined"
          onClick={handleLeaveRoom}
          size="small"
        >
          Leave Room
        </Button>
      </Box>

      <MultiplayerRoomCard room={{ ...room, participants: room.participants }} />

      <Box mt={3}>
        <ParticipantList
          participants={room.participants || []}
          currentPlayerId={participant.playerId}
          onReadyToggle={handleReadyToggle}
          disabled={updating}
        />

        {allReady && (
          <Box mt={3} display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartGame}
              disabled={updating}
              size="large"
            >
              {updating ? <CircularProgress size={24} /> : 'Start Game'}
            </Button>
          </Box>
        )}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PlayerRoomPage;