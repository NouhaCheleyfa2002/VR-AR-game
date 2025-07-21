import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useRoom } from '../../context/RoomContext';
import  {QrScanner}  from '@yudiel/react-qr-scanner';
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

import { getAllUsers, getUserScore } from '../../api/UserApi';
import { getSessionsByPlayerId } from '../../api/GameplaySession';
import { getAllInvitations } from '../../api/Invitation';
import { getAllRooms, joinRoom } from '../../api/RoomApi';

// Custom styled components for gaming theme
const GamingCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  border: '1px solid #3d5a80',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(61, 90, 128, 0.3)',
    border: '1px solid #5a7ca8',
  },
}));

const GlowButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0f3460, #16537e)',
  border: '1px solid #3d5a80',
  borderRadius: '8px',
  color: '#ffffff',
  fontWeight: 'bold',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #16537e, #1e6091)',
    boxShadow: '0 0 20px rgba(22, 83, 126, 0.5)',
    transform: 'translateY(-1px)',
  },
}));

const RankAvatar = styled(Avatar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #c9b037, #f4e76e)',
  border: '3px solid #d4af37',
  width: 80,
  height: 80,
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#1a1a2e',
  boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
}));

const QRScannerDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    border: '1px solid #3d5a80',
    borderRadius: '12px',
    color: '#ffffff',
    maxWidth: '500px',
    width: '90%',
  },
}));

const ScannerContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '300px',
  background: '#000',
  borderRadius: '8px',
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
  border: '2px solid #c9b037',
  borderRadius: '8px',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    width: '20px',
    height: '20px',
    border: '3px solid #c9b037',
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
  
  // QR Scanner states
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  
  // Tab states
  const [tab, setTab] = useState(0);
  const [partnerTab, setPartnerTab] = useState(0);

  // Fetch all data on component mount
  useEffect(() => {
    if (!user || !user._id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data
        const playerSessions = await getSessionsByPlayerId(user._id);
        const ongoing = playerSessions.find(session => !session.endTime);
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
        
        // Set leaderboard data
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
        
        // Fetch invitations
        const allInvitations = await getAllInvitations();
        const playerInvitations = allInvitations.filter(invitation => 
          invitation.receiverEmail === user?.email || 
          invitation.senderId === user._id
        );
        
        setAcceptedPartners(playerInvitations.filter(inv => inv.invitationStatus === 'ACCEPTED'));
        setPendingPartners(playerInvitations.filter(inv => inv.invitationStatus === 'PENDING'));
        
        // Fetch available rooms
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

  // QR Scanner functionality

  const handleQRCodeDetected = (result) => {
    try {
      // Parse room data from QR code
      let roomId;
      if (typeof result === 'string') {
        // Handle URL format: /player/rooms/:roomId/join
        if (result.includes('/rooms/')) {
          roomId = result.split('/rooms/')[1].split('/')[0];
        } else {
          // Assume it's just the room ID
          roomId = result;
        }
      } else if (result?.roomId) {
        // Handle object format { roomId: '...' }
        roomId = result.roomId;
      }
      
      if (!roomId) {
        throw new Error('Invalid room data in QR code');
      }
      
      // Attempt to join the room
      handleJoinRoom(roomId);
    } catch (error) {
      console.error('QR code error:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };


  const openScanner = () => {
    setScannerOpen(true);
    startCamera();
  };

  const closeScanner = () => {
    stopCamera();
    setScannerOpen(false);
    setScanError('');
  };


  const handleLogout = () => {
    logout();
    navigate('/login');
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
        sx={{ background: 'linear-gradient(135deg, #0f1419 0%, #1a1a2e 100%)' }}
      >
        <CircularProgress sx={{ color: '#c9b037' }} size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1419 0%, #1a1a2e 100%)',
      color: '#ffffff',
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
          <GamepadIcon sx={{ fontSize: 40, color: '#c9b037' }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#c9b037' }}>
            Escape Games
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton sx={{ color: '#ffffff' }}>
            <Badge badgeContent={pendingPartners.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton sx={{ color: '#ffffff' }}>
            <SettingsIcon />
          </IconButton>
          <IconButton onClick={handleLogout} sx={{ color: '#ff6b6b' }}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Welcome Section */}
      <GamingCard sx={{ mb: 4, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <RankAvatar>
            <TrophyIcon />
          </RankAvatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Welcome back, {user?.userName || 'Player'}!
            </Typography>
            <Typography variant="h6" sx={{ color: '#c9b037', mb: 1 }}>
              Rank: {getRankFromScore(bestScore)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Score: {bestScore}
              </Typography>
              <Box sx={{ flex: 1, maxWidth: 300 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={getScoreProgress(bestScore)} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#16213e',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#c9b037',
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </GamingCard>

      <Grid container spacing={3}>
        {/* Left Panel - Current Session, Achievements, Partners */}
        <Grid item xs={12} lg={3} md={4}>
          <Stack spacing={3}>
            {/* Current Session */}
            <GamingCard className='w-[350px]'>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PlayArrowIcon />
                  Current Session
                </Typography>
                {recentSession ? (
                  <Box>
                    <Chip 
                      label="Live" 
                      color="success" 
                      size="small" 
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Game ID:</strong> {recentSession.gameId}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Room:</strong> {recentSession.roomId}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Score:</strong> {recentSession.totalScore}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Started: {new Date(recentSession.startTime).toLocaleString()}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <GamepadIcon sx={{ fontSize: 48, color: '#3d5a80', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No active session
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </GamingCard>

            {/* Achievements */}
            <GamingCard>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiEventsIcon />
                  Achievements
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#c9b037', width: 48, height: 48 }}>
                      <StarIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{bestScore}</Typography>
                      <Typography variant="body2" color="text.secondary">Best Score</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#3d5a80', width: 48, height: 48 }}>
                      <GamepadIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">-</Typography>
                      <Typography variant="body2" color="text.secondary">Games Played</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#16537e', width: 48, height: 48 }}>
                      <TrophyIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{getRankFromScore(bestScore)}</Typography>
                      <Typography variant="body2" color="text.secondary">Current Rank</Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </GamingCard>

            {/* Partners */}
            <GamingCard>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon />
                  Partners
                </Typography>
                <Tabs
                  value={partnerTab}
                  onChange={(_, newVal) => setPartnerTab(newVal)}
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': { color: '#ffffff', fontSize: '0.8rem' },
                    '& .Mui-selected': { color: '#c9b037' },
                    '& .MuiTabs-indicator': { backgroundColor: '#c9b037' }
                  }}
                >
                  <Tab label={`Active (${acceptedPartners.length})`} />
                  <Tab label={`Pending (${pendingPartners.length})`} />
                </Tabs>
                <Divider sx={{ my: 2, borderColor: '#3d5a80' }} />
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
                            background: 'linear-gradient(135deg, #16213e 0%, #1a1a2e 100%)',
                            borderRadius: 1,
                            border: '1px solid #3d5a80'
                          }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#c9b037' }}>
                              <PersonIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {partner.partnerName || 'Unknown Partner'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Since: {partner.since ? new Date(partner.since).toLocaleDateString() : 'Unknown'}
                              </Typography>
                            </Box>
                            <Chip label="Active" color="success" size="small" />
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <GroupIcon sx={{ fontSize: 48, color: '#3d5a80', mb: 2 }} />
                          <Typography color="text.secondary">No active partners</Typography>
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
                            background: 'linear-gradient(135deg, #16213e 0%, #1a1a2e 100%)',
                            borderRadius: 1,
                            border: '1px solid #3d5a80'
                          }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#3d5a80' }}>
                              <PersonIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {partner.partnerName || 'Unknown Partner'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Awaiting response
                              </Typography>
                            </Box>
                            <Chip label="Pending" color="warning" size="small" />
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <NotificationsIcon sx={{ fontSize: 48, color: '#3d5a80', mb: 2 }} />
                          <Typography color="text.secondary">No pending invitations</Typography>
                        </Box>
                      )}
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </GamingCard>
          </Stack>
        </Grid>

        {/* Middle Panel - Quick Actions */}
        <Grid item xs={12} lg={6} md={4}>
          <GamingCard sx={{ height: 'fit-content', width: 500 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <QrCodeScannerIcon />
                Quick Actions
              </Typography>
              <Stack spacing={3}>
                <GlowButton
                  startIcon={<QrCodeScannerIcon />}
                  fullWidth
                  size="large"
                  sx={{ py: 2 }}
                  onClick={openScanner}
                >
                  Scan QR Code
                </GlowButton>
                
                <GlowButton
                  fullWidth
                  size="large"
                  sx={{ py: 2 }}
                  onClick={() => navigate('/player/rooms')}
                >
                  Browse Rooms
                </GlowButton>

                <GlowButton
                  fullWidth
                  size="large"
                  sx={{ py: 2 }}
                  onClick={() => navigate('/player/join')}
                >
                  Join Room Manually
                </GlowButton>
              </Stack>
            </CardContent>
          </GamingCard>
        </Grid>

        {/* Right Panel - Leaderboard */}
      <Grid item xs={12} lg={3} md={4}>
        <GamingCard sx={{ height: 'fit-content', width: 500 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <QrCodeScannerIcon />
            Quick Actions
          </Typography>
          <Stack spacing={3}>
            <GlowButton
              startIcon={<QrCodeScannerIcon />}
              fullWidth
              size="large"
              sx={{ py: 2 }}
              onClick={openScanner}
            >
              Scan QR Code
            </GlowButton>
            
            <GlowButton
              fullWidth
              size="large"
              sx={{ py: 2 }}
              onClick={() => navigate('/player/rooms')}
            >
              Join Rooms
            </GlowButton>
          </Stack>

          {availableRooms.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
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
                      backgroundColor: 'rgba(61, 90, 128, 0.2)',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(61, 90, 128, 0.4)',
                      }
                    }}
                  >
                    <Box>
                      <Typography>{room.roomName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {room.participants.length}/{room.maxPlayers} players
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => handleJoinRoom(room._id)}
                      disabled={roomLoading}
                    >
                      {roomLoading ? <CircularProgress size={20} /> : 'Join'}
                    </Button>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </CardContent>
      </GamingCard>
        </Grid>
      </Grid>

      {/* QR Scanner Dialog */}
      <QRScannerDialog open={scannerOpen} onClose={closeScanner}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box component="span">Scan QR Code</Box>
          <IconButton onClick={closeScanner}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: '300px',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <QrScanner
              onStart={() => setScannerLoading(false)}
              onDecode={(result) => {
                handleQRCodeDetected(result);
                closeScanner();
              }}
              onError={(error) => {
                if (error?.message.includes('Permission')) {
                  setScanError('Camera permission denied. Please allow camera access in your browser settings.');
                } else {
                  setScanError(error?.message || 'Failed to access camera');
                }
              }}
              constraints={{
                facingMode: 'environment'
              }}
              containerStyle={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              videoStyle={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              viewFinder={() => (
                <ScannerOverlay />
              )}
            />
              {scannerLoading && (
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.7)'
                }}>
                  <CircularProgress sx={{ color: '#c9b037' }} />
                 </Box>
                )}
          </Box>
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
              background: 'linear-gradient(45deg, #d32f2f, #b71c1c)',
              '&:hover': {
                background: 'linear-gradient(45deg, #b71c1c, #8e0000)',
              }
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </QRScannerDialog>
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
    </Box>
  );
};

export default Home;