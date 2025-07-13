import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Divider, 
  CircularProgress, 
  Alert,
  Button,
  Snackbar
} from '@mui/material';
import GameplaySessionList from '../../components/gameplaySession/GameplaySessionList';
import GameplaySessionDetail from '../../components/gameplaySession/GameplaySessionDetail';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { getSessionsByPlayerId } from '../../api/GameplaySession';

const GameplaySessionViewer = ({ playerId = 'p1' }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch sessions for the specific player
  useEffect(() => {
    const fetchPlayerSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSessionsByPlayerId(playerId);
        setSessions(data);
      } catch (err) {
        setError('Failed to load your gameplay sessions. Please try again.');
        console.error('Error fetching player sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchPlayerSessions();
    }
  }, [playerId]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await getSessionsByPlayerId(playerId);
      setSessions(data);
      setSnackbar({
        open: true,
        message: 'Sessions refreshed successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to refresh sessions',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Transform sessions data for charts
  const chartData = sessions.map((s, index) => ({
    name: `Session ${index + 1}`,
    score: s.totalScore || 0,
    hintsUsed: s.hintsUsed || 0,
    errorRate: parseFloat(s.errorRate) || 0,
    avgSolveTime: parseFloat(s.avgSolveTime) || 0,
    completionRate: parseFloat(s.completionRate) || 0,
  }));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', ml: 13 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, ml: 13 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, ml: 13 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" textAlign="center" sx={{ flex: 1 }}>
          Your Gameplay Sessions
        </Typography>
        <Button variant="outlined" onClick={handleRefresh} size="small">
          Refresh
        </Button>
      </Box>

      {!selectedSession ? (
        <>
          {sessions.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No gameplay sessions found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Start playing to see your session history and analytics here.
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Score Over Sessions
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="score" stroke="#1976d2" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Hints & Errors Per Session
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="hintsUsed" stroke="#f57c00" strokeWidth={2} />
                        <Line type="monotone" dataKey="errorRate" stroke="#d32f2f" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Average Solve Time (minutes)
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="avgSolveTime" stroke="#388e3c" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Completion Rate (%)
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="completionRate" stroke="#0288d1" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>

              <GameplaySessionList
                sessions={sessions}
                onSelectSession={setSelectedSession}
              />
            </>
          )}
        </>
      ) : (
        <GameplaySessionDetail 
          session={selectedSession}
          onBack={() => setSelectedSession(null)}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GameplaySessionViewer;