import React, { useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import GroupIcon from '@mui/icons-material/Group';
import { mockSessions } from '../../assets/dummyData';

const playerId = 'p1';

const mockPartners = [
  {
    invitationId: 1,
    partnerName: 'Medina VR Tours',
    receiverEmail: 'player1@example.com',
    sentAt: '2025-07-05T10:00:00Z',
    invitationStatus: 'PENDING',
  },
  {
    invitationId: 2,
    partnershipId: 101,
    partnerName: 'Andalusian Culture VR',
    receiverEmail: 'chelayfanouha@gmail.com',
    sentAt: '2025-06-20T15:00:00Z',
    invitationStatus: 'ACCEPTED',
    since: '2025-06-22',
    isOnline: true,
    lastInteraction: '2025-07-04T14:00:00Z',
  },
];

const topPlayers = [
  { name: 'Player A', score: 120 },
  { name: 'Player B', score: 110 },
  { name: 'Player C', score: 95 },
];

const recentPlayers = [
  { name: 'Player X', lastPlayed: '2025-07-08' },
  { name: 'Player Y', lastPlayed: '2025-07-07' },
  { name: 'Player Z', lastPlayed: '2025-07-06' },
];

const PlayerHomePage = () => {
  const recentSession = mockSessions.find(
    (s) => s.playerId === playerId && !s.endTime
  );
 const navigate = useNavigate();
  const allPlayerSessions = mockSessions.filter((s) => s.playerId === playerId);
  const bestScore = Math.max(...allPlayerSessions.map((s) => s.totalScore));

  const [tab, setTab] = useState(0);
  const [partnerTab, setPartnerTab] = useState(0);

  const acceptedPartners = mockPartners.filter(p => p.invitationStatus === 'ACCEPTED');
  const pendingPartners = mockPartners.filter(p => p.invitationStatus === 'PENDING');

   const { logout } = useContext(AuthContext);
    
      const handleLogout = () => {
        logout();
        navigate('/login');
      };

  return (
    <Box p={4}>
      {/* Welcome Banner */}
      <Box
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          borderRadius: 2,
          p: 3,
          mb: 4,
        }}
      >
        <Typography variant="h4">Welcome back, Player {playerId.toUpperCase()}!</Typography>
        <Typography variant="subtitle1">Ready for your next challenge?</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Content */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Join or Scan */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Start a New Adventure
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<QrCodeScannerIcon />}
                      fullWidth
                    >
                      Scan QR Code
                    </Button>
                    <Button variant="outlined" fullWidth>
                      Join a Room
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Ongoing Session */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {recentSession ? 'Current Session' : 'No Ongoing Session'}
                  </Typography>
                  {recentSession ? (
                    <Box>
                      <Typography>Game ID: {recentSession.gameId}</Typography>
                      <Typography>Room ID: {recentSession.roomId}</Typography>
                      <Typography>Total Score: {recentSession.totalScore}</Typography>
                      <Typography>
                        Started: {new Date(recentSession.startTime).toLocaleString()}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      You have no ongoing sessions. Start a new game to begin!
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Achievements */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Your Achievements
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'gold' }}>
                      <EmojiEventsIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">Top Score</Typography>
                      <Typography variant="h5">{bestScore}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Leaderboard Tabs */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Leaderboard</Typography>
                  <Tabs value={tab} onChange={(_, newVal) => setTab(newVal)}>
                    <Tab label="Top Players" />
                    <Tab label="Recently Active" />
                  </Tabs>
                  <Divider sx={{ my: 1 }} />
                  {tab === 0 && (
                    <Stack spacing={1}>
                      {topPlayers.map((p, i) => (
                        <Typography key={i}>
                          {i + 1}. {p.name} – {p.score} pts
                        </Typography>
                      ))}
                    </Stack>
                  )}
                  {tab === 1 && (
                    <Stack spacing={1}>
                      {recentPlayers.map((p, i) => (
                        <Typography key={i}>
                          {p.name} – Last played on {p.lastPlayed}
                        </Typography>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Panel - Partners */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <GroupIcon fontSize="small" sx={{ mr: 1 }} />
                Your Partners
              </Typography>
              <Tabs
                value={partnerTab}
                onChange={(_, newVal) => setPartnerTab(newVal)}
                variant="fullWidth"
              >
                <Tab label="Accepted" />
                <Tab label="Pending" />
              </Tabs>
              <Divider sx={{ my: 1 }} />
              <Box>
                {partnerTab === 0 &&
                  acceptedPartners.map((p) => (
                    <Box key={p.partnershipId} mb={2}>
                      <Typography variant="subtitle2">{p.partnerName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Online: {p.isOnline ? 'Yes' : 'No'}
                      </Typography>
                    </Box>
                  ))}
                {partnerTab === 1 &&
                  pendingPartners.map((p) => (
                    <Box key={p.invitationId} mb={2}>
                      <Typography variant="subtitle2">{p.partnerName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Awaiting response
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <button onClick={handleLogout} className='text-blue-600'>Logout</button>
    </Box>
  );
};

export default PlayerHomePage;
