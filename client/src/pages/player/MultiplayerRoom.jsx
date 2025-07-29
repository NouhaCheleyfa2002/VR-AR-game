import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
  Container,
  CircularProgress,
  Alert,
  Snackbar,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Chip
} from '@mui/material';
import QRCode from 'react-qr-code';
import { QrCode as QrCodeIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { Share, ContentCopy } from '@mui/icons-material';
import MultiplayerRoomCard from '../../components/rooms/MultiplayerRoomCard';
import ParticipantList from '../../components/roomParticipant/PaticipantList';
import { getRoomById, updateRoom } from '../../api/RoomApi';
import { getAllParticipants } from '../../api/RoomParticipant'; 
import { useRoom } from '../../context/RoomContext';

const PlayerRoomPage = () => {
  const {
    room,
    participant,
    loading: contextLoading,
    error: contextError,
    leaveRoom: contextLeaveRoom,
    joinRoom
  } = useRoom();

  const [fullParticipants, setFullParticipants] = useState([]); // Add this state
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [pollingInterval, setPollingInterval] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  const navigate = useNavigate();
  const { roomId } = useParams();

  useEffect(() => {
    // Initialize room if not already loaded
    if (!room && !contextLoading) {
      initializeRoom();
    } else {
      setLocalLoading(false);
    }

    // Set up polling
    const interval = setInterval(fetchRoomData, 5000);
    setPollingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [roomId, room, contextLoading]);

  // Add effect to fetch full participant data when room participants change
  useEffect(() => {
    if (room?.participants?.length > 0) {
      fetchFullParticipants();
    }
  }, [room?.participants]);

  const fetchFullParticipants = async () => {
    try {
      // Get all participants
      const allParticipants = await getAllParticipants();
      
      
      // Filter to get only participants that are in this room
      const roomParticipantIds = room.participants || [];
      const roomFullParticipants = allParticipants.filter(p => 
        roomParticipantIds.includes(p._id)
      );
      
      setFullParticipants(roomFullParticipants);
    } catch (error) {
      console.error('Error fetching full participants:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load participant details',
        severity: 'error'
      });
    }
  };

  const initializeRoom = async () => {
    try {
      setLocalLoading(true);
      
      // Try to join the room through context
      await joinRoom(roomId);
      
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
      navigate(`/player/rooms/${roomId}/join`);
    } finally {
      setLocalLoading(false);
    }
  };

  const fetchRoomData = async () => {
    if (!room || !participant) return
    
    try {
      
      if (!room) {
        setSnackbar({
          open: true,
          message: 'Room no longer exists',
          severity: 'error'
        });
        handleLeaveRoom();
        return;
      }

      if (!participant) {
        setSnackbar({
          open: true,
          message: 'You have been removed from the room',
          severity: 'warning'
        });
        handleLeaveRoom();
        return;
      }

      // Refresh participant data during polling
      if (room.participants?.length > 0) {
        fetchFullParticipants();
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  };

  const handleReadyToggle = async (updatedParticipant, toggleResponse, roomId) => {
    if (updating || !room || !participant) return;
  
    try {
      setUpdating(true);
  
      // Update the full participants state with the API response data
      setFullParticipants(prevParticipants =>
        prevParticipants.map((p) =>
          p._id === updatedParticipant._id ? updatedParticipant : p
        )
      );
  
      // Only update room status if the toggle response indicates all participants are ready/not ready
      if (roomId && toggleResponse?.allParticipantsReady !== undefined) {
        const roomUpdateData = {
          roomStatus: toggleResponse.allParticipantsReady ? 'ready' : 'waiting'
        };
        
      }
  
      setSnackbar({
        open: true,
        message: toggleResponse?.message || `Participant marked as ${updatedParticipant.isReady ? 'ready' : 'not ready'}`,
        severity: 'success'
      });
  
    } catch (error) {
      console.error('Error updating ready status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update ready status',
        severity: 'error'
      });
      
      // Refresh participant data on error
      fetchFullParticipants();
    } finally {
      setUpdating(false);
    }
  };
  

  const handleLeaveRoom = () => {
    if (pollingInterval) clearInterval(pollingInterval);
    contextLeaveRoom();
    navigate(`/player/rooms/${roomId}/join`);
  };

  const handleStartGame = async () => {
    if (!allReady || !room) return;

    try {
      setUpdating(true);
      const updatedRoomData = { ...room, roomStatus: 'Active' };

      await updateRoom(room.roomId, updatedRoomData);

      setSnackbar({
        open: true,
        message: 'Game started!',
        severity: 'success'
      });

      // TODO: Navigate to game logic
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
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareRoom = async () => {
    const shareUrl = `${window.location.origin}/player/rooms/${roomId}/join`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join My Game Room',
          text: `Join my game room: ${room?.roomName || 'Game Room'}`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  if (contextLoading || localLoading) {
    return (
      <Container sx={{ mt: 6, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading room...
        </Typography>
      </Container>
    );
  }

  if (contextError || !room || !participant) {
    return (
      <Container sx={{ mt: 6 }}>
        <Typography variant="h6" color="text.secondary">
          {contextError || 'No room session found. Please scan a QR code to join.'}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate(`/player/rooms/${roomId}/join`)} 
          sx={{ mt: 2 }}
        >
          Join Room
        </Button>
      </Container>
    );
  }

  // Use fullParticipants for ready check
  const allReady = fullParticipants?.every((p) => p.isReady) || false;
  const joinUrl = `${window.location.origin}/player/rooms/${roomId}/join`;

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
         
        </Typography>
        <Button color="error" variant="outlined" onClick={handleLeaveRoom} size="small">
          Leave Room
        </Button>
      </Box>

      <MultiplayerRoomCard room={{ ...room, participants: room.participants }} />
 
    
      <Box mt={3}>
        <ParticipantList
          participants={fullParticipants || []}
          currentPlayerId={participant.playerId}
          onReadyToggle={handleReadyToggle}
          disabled={updating}
        />
      </Box>

      {/* Host-only controls */}
      {participant?.isHost && (
        <Box mt={4}>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Invite Players
            </Typography>
            
            <Box display="flex" gap={2} mb={2}>
              <Button 
                variant="outlined" 
                onClick={() => setQrOpen(true)}
                startIcon={<QrCodeIcon fontSize="small" />}
              >
                Show QR Code
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={shareRoom}
                startIcon={<Share />}
              >
                Share Room
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={() => copyToClipboard(joinUrl)}
                startIcon={<ContentCopy />}
                color={copySuccess ? "success" : "primary"}
              >
                {copySuccess ? "Copied!" : "Copy Link"}
              </Button>
            </Box>

          </Paper>

          {allReady ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartGame}
              disabled={updating}
              size="large"
              fullWidth
            >
              {updating ? <CircularProgress size={24} /> : 'Start Game'}
            </Button>
          ) : (
            <Alert severity="info">
              Waiting for all players to be ready... ({fullParticipants?.filter(p => p.isReady).length || 0}/{fullParticipants?.length || 0})
            </Alert>
          )}
        </Box>
      )}

      {/* Enhanced QR Code Dialog */}
      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          Scan to Join Room
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', p: 3 }}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'white', display: 'inline-block' }}>
            <QRCode 
              value={joinUrl}
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </Paper>
          
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            {room.roomName}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Room Code: <strong>{room.roomCode || roomId.slice(-6)}</strong>
          </Typography>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Or share this link:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                wordBreak: 'break-all',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={() => copyToClipboard(joinUrl)}
            >
              {joinUrl}
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>How to join:</strong>
            </Typography>
            <Typography variant="body2" component="div" sx={{ mt: 1 }}>
              1. Scan QR code with phone camera<br/>
              2. Tap the link that appears<br/>
              3. You'll automatically join the room
            </Typography>
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={shareRoom} variant="outlined" startIcon={<Share />}>
            Share
          </Button>
          <Button 
            onClick={() => copyToClipboard(joinUrl)} 
            variant="outlined" 
            startIcon={<ContentCopy />}
          >
            Copy Link
          </Button>
          <Button onClick={() => setQrOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

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