import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';

import GameplaySessionList from '../../components/gameplaySession/GameplaySessionList';
import GameplaySessionDetail from '../../components/gameplaySession/GameplaySessionDetail';
import GameplayChartsPanel from '../../components/gameplaySession/GameplayChartsPanel';

import { getAllSessions, deleteSession } from '../../api/GameplaySession';

const ITEMS_PER_PAGE = 5;

const ManageGameplaySessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch sessions on component mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllSessions();
        setSessions(data);
        setFiltered(data);
      } catch (err) {
        setError('Failed to load sessions. Please try again.');
        console.error('Error fetching sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Filter and sort sessions
  useEffect(() => {
    let filteredSessions = [...sessions];

    if (search) {
      filteredSessions = filteredSessions.filter(
        (s) =>
          s.playerId?.toLowerCase().includes(search.toLowerCase()) ||
          s.sessionId?.toLowerCase().includes(search.toLowerCase()) ||
          s._id?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === 'score') {
      filteredSessions.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
    } else if (sortBy === 'date') {
      filteredSessions.sort((a, b) => new Date(b.startTime || b.createdAt) - new Date(a.startTime || a.createdAt));
    }

    setFiltered(filteredSessions);
    setPage(1);
  }, [search, sortBy, sessions]);

  const handlePageChange = (_, value) => setPage(value);

  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteSession(sessionId);
      const updated = sessions.filter((s) => s.sessionId !== sessionId && s._id !== sessionId);
      setSessions(updated);
      setFiltered(updated);
      setSelectedSession(null);
      setSnackbar({
        open: true,
        message: 'Session deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete session. Please try again.',
        severity: 'error'
      });
      console.error('Error deleting session:', err);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await getAllSessions();
      setSessions(data);
      setFiltered(data);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
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
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Manage Gameplay Sessions
        </Typography>
        <Button variant="outlined" onClick={handleRefresh}>
          Refresh
        </Button>
      </Stack>

      {/* Filter/Search Bar */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={3}>
        <TextField
          placeholder="Search by Session or Player ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <FormControl>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            startAdornment={<SortIcon sx={{ mr: 1 }} />}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="date">Start Date</MenuItem>
            <MenuItem value="score">Total Score</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Charts */}
      <Box mt={5}>
        <GameplayChartsPanel sessions={filtered} />
      </Box>
      
      {/* List */}
      {filtered.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {search ? 'No sessions found matching your search.' : 'No gameplay sessions available.'}
          </Typography>
        </Box>
      ) : (
        <GameplaySessionList sessions={paginated} onSelectSession={setSelectedSession} />
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={Math.ceil(filtered.length / ITEMS_PER_PAGE)}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Gameplay Session</DialogTitle>
        <DialogContent dividers>
          <GameplaySessionDetail session={selectedSession} onBack={() => setSelectedSession(null)} />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => handleDeleteSession(selectedSession.sessionId || selectedSession._id)} 
            color="error"
          >
            Delete
          </Button>
          <Button onClick={() => setSelectedSession(null)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

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

export default ManageGameplaySessionsPage;