import React, { useEffect, useState } from 'react';
import {
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Button,
  Chip,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import MultiplayerRoomList from '../../components/rooms/MultiplayerRoomList';
import {
  getAllRooms,
  deleteRoom,
} from '../../api/RoomApi'; // Adjust the import path as needed

const AdminRoomManagementPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await getAllRooms();
      setRooms(data);
      setSnackbar({ 
        open: true, 
        message: `${data.length} rooms loaded successfully`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error loading rooms:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to load rooms', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await getAllRooms();
      setRooms(data);
      setSnackbar({ 
        open: true, 
        message: 'Rooms refreshed successfully', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error refreshing rooms:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to refresh rooms', 
        severity: 'error' 
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await deleteRoom(roomId);
      setRooms(prev => prev.filter(room => room.roomId !== roomId));
      setSnackbar({ 
        open: true, 
        message: 'Room deleted successfully', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to delete room', 
        severity: 'error' 
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredRooms = rooms
    .filter(room =>
      filterStatus === 'All' ? true : room.roomStatus === filterStatus
    )
    .sort((a, b) => {
      const aParticipants = a.participants?.length || 0;
      const bParticipants = b.participants?.length || 0;
      return sortOrder === 'asc'
        ? aParticipants - bParticipants
        : bParticipants - aParticipants;
    });

  // Get unique room statuses from the data for dynamic filter options
  const availableStatuses = [...new Set(rooms.map(room => room.roomStatus))].filter(Boolean);

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading rooms...
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Multiplayer Room Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Room Statistics */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Chip 
          label={`Total Rooms: ${rooms.length}`} 
          color="primary" 
          variant="outlined" 
        />
        <Chip 
          label={`Active: ${rooms.filter(r => r.roomStatus === 'Active').length}`} 
          color="success" 
          variant="outlined" 
        />
        <Chip 
          label={`Waiting: ${rooms.filter(r => r.roomStatus === 'Waiting').length}`} 
          color="warning" 
          variant="outlined" 
        />
        <Chip 
          label={`Total Players: ${rooms.reduce((sum, room) => sum + (room.participants?.length || 0), 0)}`} 
          color="info" 
          variant="outlined" 
        />
      </Box>

      {/* Filters and Sorting */}
      <Box display="flex" gap={2} mb={3}>
        <FormControl>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
            size="small"
          >
            <MenuItem value="All">All</MenuItem>
            {availableStatuses.map(status => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Sort by Players</InputLabel>
          <Select
            value={sortOrder}
            label="Sort by Players"
            onChange={(e) => setSortOrder(e.target.value)}
            size="small"
          >
            <MenuItem value="asc">Fewest First</MenuItem>
            <MenuItem value="desc">Most First</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Room List */}
      {rooms.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No rooms found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Rooms will appear here when players create multiplayer games
          </Typography>
        </Box>
      ) : filteredRooms.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No rooms match the current filters
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Try adjusting your filter settings
          </Typography>
        </Box>
      ) : (
        <MultiplayerRoomList 
          rooms={filteredRooms} 
          onDeleteRoom={handleDeleteRoom}
        />
      )}

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

export default AdminRoomManagementPage;