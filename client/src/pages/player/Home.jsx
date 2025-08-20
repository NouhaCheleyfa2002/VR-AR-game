import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useRoom } from '../../context/RoomContext';

import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Stack,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  IconButton,
  Badge,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import GroupIcon from '@mui/icons-material/Group';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import TrophyIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import GamepadIcon from '@mui/icons-material/SportsEsports';
import StarIcon from '@mui/icons-material/Star';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { getAllUsers, getUserScore } from '../../api/UserApi';
import { getSessionsByPlayerId } from '../../api/GameplaySession';
import { getAllInvitations } from '../../api/Invitation';
import { getAllRooms, joinRoom ,getRoomByCode} from '../../api/RoomApi';
import { BrowserQRCodeReader } from '@zxing/library';

// Custom styled components with light theme
const LightCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(251, 191, 36, 0.2)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(251, 191, 36, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(251, 191, 36, 0.2)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
  },
}));

const AmberButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #f59e0b, #d97706)',
  border: 'none',
  borderRadius: '12px',
  color: '#ffffff',
  fontWeight: 600,
  textTransform: 'none',
  padding: '12px 24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #d97706, #b45309)',
    boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
    transform: 'translateY(-2px)',
  },
}));

const RankAvatar = styled(Avatar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #f59e0b, #d97706)',
  border: '3px solid #fbbf24',
  width: 80,
  height: 80,
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#ffffff',
  boxShadow: '0 8px 32px rgba(251, 191, 36, 0.3)',
}));

const LightDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(251, 191, 36, 0.2)',
    borderRadius: '16px',
    color: '#1f2937',
    maxWidth: '500px',
    width: '90%',
  },
}));

const ScannerContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '300px',
  background: '#000',
  borderRadius: '12px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ScannerOverlay = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '200px',
  height: '200px',
  border: '2px solid #f59e0b',
  borderRadius: '8px',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    width: '20px',
    height: '20px',
    border: '3px solid #f59e0b',
  },
  '&::before': {
    top: '-3px',
    left: '-3px',
    borderRight: 'none',
    borderBottom: 'none',
  },
  '&::after': {
    top: '-3px',
    right: '-3px',
    borderLeft: 'none',
    borderBottom: 'none',
  },
});

const Home = () => {
  const navigate = useNavigate();
  const { logout, user, token } = useContext(AuthContext);
  const { room, joinRoom: contextJoinRoom } = useRoom();
  const [loading, setLoading] = useState(true);
  const [recentSession, setRecentSession] = useState(null);
  const [bestScore, setBestScore] = useState(0);
  const [topPlayers, setTopPlayers] = useState([]);
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [acceptedPartners, setAcceptedPartners] = useState([]);
  const [pendingPartners, setPendingPartners] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [joinRoomDialogOpen, setJoinRoomDialogOpen] = useState(false);
  const [roomInputValue, setRoomInputValue] = useState('');
  const [roomInputError, setRoomInputError] = useState('');
  
  // QR Scanner states
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanError, setScanError] = useState('');
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  // Tab states
  const [tab, setTab] = useState(0);
  const [partnerTab, setPartnerTab] = useState(0);

  const openScanner = async () => {
    try {
      setScannerOpen(true);
      setScanError('');
      await initializeCamera();
    } catch (error) {
      console.error('Scanner error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to initialize scanner',
        severity: 'error'
      });
      setScannerOpen(false);
    }
  };

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
  
      if (!videoRef.current) {
        throw new Error('Video element not available');
      }
  
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      codeReaderRef.current = new BrowserQRCodeReader();
      startScanning();
      
    } catch (err) {
      console.error('Camera initialization error:', err);
      setScanError(`Camera access failed: ${err.message}`);
      throw err;
    }
  };

  const startScanning = () => {
    if (!codeReaderRef.current || !videoRef.current) return;
  
    codeReaderRef.current.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
      if (result) {
        handleQRCodeDetected(result.getText());
      }
      if (error) {
        const errorMessage = error.message || error.toString() || 'Unknown scanning error';
        if (!errorMessage.includes('No QR code found') && !errorMessage.includes('NotFoundException')) {
          console.error('QR scanning error:', error);
          setScanError(errorMessage);
        }
      }
    });
  };
  
  const closeScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    
    setScannerOpen(false);
    setScanError('');
  };

  // Fetch all data on component mount
  useEffect(() => {
    if (!user || !user._id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const sessions = await getSessionsByPlayerId(user._id);
        const ongoing = sessions.find(session => !session.endTime);
        const latest = sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))[0];
        
        setRecentSession(ongoing || latest);
        setRecentSession(ongoing);

        const allUsers = await getAllUsers();
        const currentUser = allUsers.find(u => u._id === user._id);
        
        if (currentUser) {
          setBestScore(currentUser.score || 0);
        } else {
          try {
            const scoreData = await getUserScore(user._id);
            setBestScore(scoreData.bestScore || scoreData.totalScore || 0);
          } catch (error) {
            if (playerSessions.length > 0) {
              const maxScore = Math.max(...playerSessions.map(s => s.totalScore || 0));
              setBestScore(maxScore);
            }
          }
        }
        
        const topPlayersData = allUsers
          .filter(user => user.role === 'player')
          .map(user => ({
            name: user.userName,
            score: user.score || 0,
            id: user._id
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        
        setTopPlayers(topPlayersData);
        
        const recentPlayersData = allUsers
          .filter(user => user.role === 'player' && user._id !== user._id)
          .map(user => {
            const lastActivity = user.updatedAt;
            return {
              name: user.userName,
              lastPlayed: lastActivity ? new Date(lastActivity).toISOString().split('T')[0] : null,
              id: user._id
            };
          })
          .filter(user => user.lastPlayed)
          .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
          .slice(0, 10);
        
        setRecentPlayers(recentPlayersData);
        
        const allInvitations = await getAllInvitations();
        const playerInvitations = allInvitations.filter(invitation => 
          invitation.receiverEmail === user?.email || 
          invitation.senderId === user._id
        );
        
        setAcceptedPartners(playerInvitations.filter(inv => inv.invitationStatus === 'ACCEPTED'));
        setPendingPartners(playerInvitations.filter(inv => inv.invitationStatus === 'PENDING'));
        
        const rooms = await getAllRooms();
        setAvailableRooms(rooms.filter(room => 
          room.roomStatus === 'Waiting' && 
          room.participants.length < room.maxPlayers
        ));
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleJoinRoom = async (roomId) => {
    if (!token) {
      setSnackbar({
        open: true,
        message: 'You must be logged in to join a room',
        severity: 'error'
      });
      return;
    }

    try {
      setRoomLoading(true);
      setRoomError(null);
      
      const response = await joinRoom(roomId, token);
      await contextJoinRoom(roomId);
      
      setSnackbar({
        open: true,
        message: 'Successfully joined room!',
        severity: 'success'
      });
      
      navigate(`/player/rooms/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      setRoomError(error.response?.data?.message || 'Failed to join room');
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to join room',
        severity: 'error'
      });
    } finally {
      setRoomLoading(false);
    }
  };

  const handleJoinRoomFromInput = async () => {
    if (!roomInputValue.trim()) {
      setRoomInputError('Please enter a room URL or access code');
      return;
    }

    if (!token) {
      setSnackbar({
        open: true,
        message: 'You must be logged in to join a room',
        severity: 'error'
      });
      return;
    }

    setRoomInputError('');

    try {
      setRoomLoading(true);
      setRoomError(null);

      let roomId;
      let response;
      
      if (roomInputValue.includes('http') || roomInputValue.includes('/')) {
        roomId = extractRoomIdFromUrl(roomInputValue);
        if (!roomId) {
          setRoomInputError('Invalid room URL format');
          return;
        }
        response = await joinRoom(roomId, token);
      } else {
        const accessCode = roomInputValue.trim();
        
        try {
          const room = await getRoomByCode(accessCode);
          roomId = room._id;
          response = await joinRoom(roomId, token);
        } catch (error) {
          throw new Error('Room not found with this access code');
        }
      }
      
      await contextJoinRoom(roomId);
      
      setSnackbar({
        open: true,
        message: 'Successfully joined room!',
        severity: 'success'
      });
      
      navigate(`/player/rooms/${roomId}`);
      setJoinRoomDialogOpen(false);
      setRoomInputValue('');
      
    } catch (error) {
      console.error('Error joining room:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to join room';
      setRoomInputError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setRoomLoading(false);
    }
  };
  
  const refreshAvailableRooms = async () => {
    try {
      const rooms = await getAllRooms();
      setAvailableRooms(rooms.filter(room => 
        room.roomStatus === 'Waiting' && 
        room.participants.length < room.maxPlayers
      ));
    } catch (error) {
      console.error('Error refreshing rooms:', error);
    }
  };
  
  const extractRoomIdFromUrl = (url) => {
    try {
      const urlParts = url.split('/');
      const roomsIndex = urlParts.findIndex(part => part === 'rooms');
      
      if (roomsIndex !== -1 && urlParts[roomsIndex + 1]) {
        return urlParts[roomsIndex + 1];
      }
      
      const lastPart = urlParts[urlParts.length - 1];
      if (lastPart && lastPart !== 'rooms') {
        return lastPart;
      }
      
      return null;
    } catch (e) {
      return null;
    }
  };
  
  const handleRoomInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoinRoomFromInput();
    }
  };

  const handleQRCodeDetected = (result) => {
    try {
      let roomId;
      if (typeof result === 'string') {
        if (result.includes('/rooms/')) {
          roomId = result.split('/rooms/')[1].split('/')[0];
        } else {
          roomId = result;
        }
      } else if (result?.roomId) {
        roomId = result.roomId;
      }

      if (!roomId) {
        throw new Error('Invalid room data in QR code');
      }

      handleJoinRoom(roomId);
      closeScanner();
    } catch (error) {
      console.error('QR code error:', error);
      setScanError(error.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle feedback navigation
  const handleFeedbackClick = () => {
    navigate('/player/feedbacks');
  };

  const getRankFromScore = (score) => {
    if (score >= 10000) return 'Champion';
    if (score >= 5000) return 'Master';
    if (score >= 2000) return 'Diamond';
    if (score >= 1000) return 'Gold';
    if (score >= 500) return 'Silver';
    return 'Bronze';
  };

  const getScoreProgress = (score) => {
    const thresholds = [0, 500, 1000, 2000, 5000, 10000];
    const currentThreshold = thresholds.find(t => score < t) || 10000;
    const previousThreshold = thresholds[thresholds.indexOf(currentThreshold) - 1] || 0;
    return ((score - previousThreshold) / (currentThreshold - previousThreshold)) * 100;
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)' }}
      >
        <CircularProgress sx={{ color: '#f59e0b' }} size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fecaca 100%)',
      color: '#1f2937',
      p: 3
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
        px: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GamepadIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f59e0b' }}>
            Escape game
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton sx={{ 
            color: '#1f2937',
            '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.1)' }
          }}>
            <Badge badgeContent={pendingPartners.length} sx={{ '& .MuiBadge-badge': { backgroundColor: '#ef4444', color: 'white' } }}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton 
            onClick={handleFeedbackClick}
            sx={{ 
              color: '#1f2937',
              '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.1)' }
            }}
          >
            <FeedbackIcon />
          </IconButton>
          <IconButton sx={{ 
            color: '#1f2937',
            '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.1)' }
          }}>
            <SettingsIcon />
          </IconButton>
          <IconButton onClick={handleLogout} sx={{ 
            color: '#ef4444',
            '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
          }}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Welcome Section */}
      <LightCard sx={{ mb: 4, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <RankAvatar>
            <TrophyIcon />
          </RankAvatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#1f2937' }}>
              Welcome back, {user?.userName || 'Player'}!
            </Typography>
            <Typography variant="h6" sx={{ color: '#f59e0b', mb: 1, fontWeight: 600 }}>
              Rank: {getRankFromScore(bestScore)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Score: {bestScore}
              </Typography>
              <Box sx={{ flex: 1, maxWidth: 300 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={getScoreProgress(bestScore)} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#fde68a',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </LightCard>

      <Grid container spacing={3}>
        {/* Left Panel - Current Session, Achievements, Partners */}
        <Grid item xs={12} lg={3} md={4}>
          <Stack spacing={3}>
            {/* Current Session */}
            <LightCard className='w-[350px]'>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#1f2937', fontWeight: 600 }}>
                  <PlayArrowIcon sx={{ color: '#f59e0b' }} />
                  Current Session
                </Typography>
                {recentSession ? (
                  <Box>
                    <Chip 
                      label="Live" 
                      sx={{ 
                        mb: 2,
                        backgroundColor: '#10b981',
                        color: 'white',
                        fontWeight: 600
                      }}
                      size="small" 
                    />
                    <Typography variant="body2" sx={{ mb: 1, color: '#1f2937' }}>
                      <strong>Game:</strong> {recentSession.gameId?.title || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: '#1f2937' }}>
                      <strong>Room:</strong> {recentSession.roomId?._id || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: '#1f2937' }}>
                      <strong>Score:</strong> {recentSession.totalScore}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Started: {new Date(recentSession.startTime).toLocaleString()}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <GamepadIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      No active session
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </LightCard>

            {/* Achievements */}
            <LightCard>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: '#1f2937', fontWeight: 600 }}>
                  <EmojiEventsIcon sx={{ color: '#f59e0b' }} />
                  Achievements
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                      width: 48, 
                      height: 48 
                    }}>
                      <StarIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#1f2937' }}>{bestScore}</Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>Best Score</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)',
                      width: 48, 
                      height: 48 
                    }}>
                      <GamepadIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#1f2937' }}>The Secrets of El Mahdia</Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>Games Played</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      background: 'linear-gradient(45deg, #06b6d4, #0891b2)',
                      width: 48, 
                      height: 48 
                    }}>
                      <TrophyIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#1f2937' }}>{getRankFromScore(bestScore)}</Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>Current Rank</Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </LightCard>

            {/* Partners */}
            <LightCard>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#1f2937', fontWeight: 600 }}>
                  <GroupIcon sx={{ color: '#f59e0b' }} />
                  Partners
                </Typography>
                <Tabs
                  value={partnerTab}
                  onChange={(_, newVal) => setPartnerTab(newVal)}
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': { 
                      color: '#6b7280', 
                      fontSize: '0.8rem',
                      fontWeight: 500
                    },
                    '& .Mui-selected': { color: '#f59e0b' },
                    '& .MuiTabs-indicator': { backgroundColor: '#f59e0b' }
                  }}
                >
                  <Tab label={`Active (${acceptedPartners.length})`} />
                  <Tab label={`Pending (${pendingPartners.length})`} />
                </Tabs>
                <Divider sx={{ my: 2, borderColor: '#fde68a' }} />
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {partnerTab === 0 && (
                    <Stack spacing={2}>
                      {acceptedPartners.length > 0 ? (
                        acceptedPartners.map((partner) => (
                          <Box key={partner.partnershipId || partner.invitationId} sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            background: 'rgba(251, 191, 36, 0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(251, 191, 36, 0.2)'
                          }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#f59e0b' }}>
                              <PersonIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                                {partner.partnerName || 'Unknown Partner'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                Since: {partner.since ? new Date(partner.since).toLocaleDateString() : 'Unknown'}
                              </Typography>
                            </Box>
                            <Chip 
                              label="Active" 
                              sx={{ 
                                backgroundColor: '#10b981',
                                color: 'white',
                                fontWeight: 600
                              }} 
                              size="small" 
                            />
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <GroupIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                          <Typography sx={{ color: '#6b7280' }}>No active partners</Typography>
                        </Box>
                      )}
                    </Stack>
                  )}
                  {partnerTab === 1 && (
                    <Stack spacing={2}>
                      {pendingPartners.length > 0 ? (
                        pendingPartners.map((partner) => (
                          <Box key={partner.invitationId} sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            background: 'rgba(251, 191, 36, 0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(251, 191, 36, 0.2)'
                          }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#d1d5db' }}>
                              <PersonIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                                {partner.partnerName || 'Unknown Partner'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                Awaiting response
                              </Typography>
                            </Box>
                            <Chip 
                              label="Pending" 
                              sx={{ 
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                fontWeight: 600
                              }} 
                              size="small" 
                            />
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <NotificationsIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                          <Typography sx={{ color: '#6b7280' }}>No pending invitations</Typography>
                        </Box>
                      )}
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </LightCard>
          </Stack>
        </Grid>

        {/* Middle Panel - Quick Actions */}
        <Grid item xs={12} lg={3} md={4}>
          <LightCard sx={{ height: 'fit-content', width: 500 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: '#1f2937', fontWeight: 600 }}>
                <QrCodeScannerIcon sx={{ color: '#f59e0b' }} />
                Quick Actions
              </Typography>
              <Stack spacing={3}>
                <AmberButton
                  startIcon={<QrCodeScannerIcon />}
                  fullWidth
                  size="large"
                  sx={{ py: 2 }}
                  onClick={openScanner}
                >
                  Scan QR Code
                </AmberButton>
                
                <AmberButton
                  fullWidth
                  size="large"
                  sx={{ py: 2 }}
                  onClick={() => setJoinRoomDialogOpen(true)}
                >
                  Join Room
                </AmberButton>
              </Stack>

              {availableRooms.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#1f2937', fontWeight: 600 }}>
                    Available Rooms
                  </Typography>
                  <Stack spacing={1}>
                    {availableRooms.slice(0, 3).map(room => (
                      <Box 
                        key={room._id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1.5,
                          backgroundColor: 'rgba(251, 191, 36, 0.1)',
                          borderRadius: 2,
                          border: '1px solid rgba(251, 191, 36, 0.2)',
                          '&:hover': {
                            backgroundColor: 'rgba(251, 191, 36, 0.2)',
                          }
                        }}
                      >
                        <Box>
                          <Typography sx={{ color: '#1f2937', fontWeight: 500 }}>{room.roomName}</Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            {room.participants.length}/{room.maxPlayers} players
                          </Typography>
                        </Box>
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => handleJoinRoom(room._id)}
                          disabled={roomLoading}
                          sx={{
                            background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #d97706, #b45309)',
                            }
                          }}
                        >
                          {roomLoading ? <CircularProgress size={20} /> : 'Join'}
                        </Button>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </LightCard>
        </Grid>

        {/* Right Panel - Leaderboard */}
        <Grid item xs={12} lg={3} md={4}>
          <LightCard sx={{ height: 'fit-content', width: 405 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#1f2937', fontWeight: 600 }}>
                <LeaderboardIcon sx={{ color: '#f59e0b' }} />
                Leaderboard
              </Typography>
              <Tabs 
                value={tab} 
                onChange={(_, newVal) => setTab(newVal)}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': { 
                    color: '#6b7280', 
                    fontSize: '0.8rem',
                    fontWeight: 500
                  },
                  '& .Mui-selected': { color: '#f59e0b' },
                  '& .MuiTabs-indicator': { backgroundColor: '#f59e0b' }
                }}
              >
                <Tab label="Top Players" />
                <Tab label="Recent" />
              </Tabs>
              <Divider sx={{ my: 2, borderColor: '#fde68a' }} />
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {tab === 0 && (
                  <Stack spacing={2}>
                    {topPlayers.length > 0 ? (
                      topPlayers.slice(0, 8).map((player, index) => (
                        <Box key={player.id} sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2,
                          p: 2,
                          background: index < 3 ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                          borderRadius: 2,
                          border: index < 3 ? '1px solid rgba(251, 191, 36, 0.2)' : 'none'
                        }}>
                          <Typography variant="h6" sx={{ 
                            color: index === 0 ? '#f59e0b' : index === 1 ? '#9ca3af' : index === 2 ? '#d97706' : '#1f2937',
                            minWidth: 24,
                            fontWeight: 'bold'
                          }}>
                            {index + 1}
                          </Typography>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: index < 3 ? '#f59e0b' : '#d1d5db'
                          }}>
                            <PersonIcon />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 500 }}>{player.name}</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>
                            {player.score}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <LeaderboardIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                        <Typography sx={{ color: '#6b7280' }}>No players found</Typography>
                      </Box>
                    )}
                  </Stack>
                )}
                {tab === 1 && (
                  <Stack spacing={2}>
                    {recentPlayers.length > 0 ? (
                      recentPlayers.slice(0, 8).map((player, index) => (
                        <Box key={player.id} sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2,
                          p: 2,
                          borderRadius: 2
                        }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#d1d5db' }}>
                            <PersonIcon />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 500 }}>{player.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              {player.lastPlayed}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Typography sx={{ color: '#6b7280' }}>No recent activity found</Typography>
                    )}
                  </Stack>
                )}
              </Box>
            </CardContent>
          </LightCard>
        </Grid>
      </Grid>

      {/* QR Scanner Dialog */}
      <LightDialog open={scannerOpen} onClose={closeScanner}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#1f2937' }}>
          <Box component="span">Scan QR Code</Box>
          <IconButton onClick={closeScanner} sx={{ color: '#6b7280' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <ScannerContainer>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
                backgroundColor: '#000'
              }}
              playsInline
            />
            <ScannerOverlay />
          </ScannerContainer>
          {scanError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {scanError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={closeScanner}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(45deg, #ef4444, #dc2626)',
              '&:hover': {
                background: 'linear-gradient(45deg, #dc2626, #b91c1c)',
              }
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </LightDialog>

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

      {/* Join Room Dialog */}
      <LightDialog 
        open={joinRoomDialogOpen} 
        onClose={() => setJoinRoomDialogOpen(false)}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#1f2937' }}>
          <Box component="span">Join Room</Box>
          <IconButton onClick={() => setJoinRoomDialogOpen(false)} sx={{ color: '#6b7280' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 2, color: '#1f2937', fontWeight: 500 }}>
              Room URL or Access Code
            </Typography>
            <input
              type="text"
              value={roomInputValue}
              onChange={(e) => setRoomInputValue(e.target.value)}
              onKeyPress={handleRoomInputKeyPress}
              placeholder="Paste room URL or enter access code"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                color: '#1f2937',
                fontSize: '16px',
                outline: 'none',
              }}
              autoFocus
            />
            <Typography variant="caption" sx={{ color: '#6b7280', mt: 1, display: 'block' }}>
              Examples: https://app.com/rooms/ABC123 or ABC123
            </Typography>
          </Box>

          {roomInputError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {roomInputError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', p: 3 }}>
          <Button
            onClick={() => setJoinRoomDialogOpen(false)}
            sx={{ 
              color: '#6b7280',
              border: '1px solid rgba(107, 114, 128, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
              }
            }}
          >
            Cancel
          </Button>
          <AmberButton
            onClick={handleJoinRoomFromInput}
            disabled={roomLoading}
          >
            {roomLoading ? <CircularProgress size={20} /> : 'Join Room'}
          </AmberButton>
        </DialogActions>
      </LightDialog>
    </Box>
  );
};

export default Home;