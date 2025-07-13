import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Pagination,
  CircularProgress,
  Box,
} from '@mui/material';
import {
  getAllEscapeGames,
  createEscapeGame,
  updateEscapeGame,
  deleteEscapeGame,
} from '../../api/EscapeGameApi';
import { toast } from 'react-toastify';

import EscapeGameCard from '../../components/escapeGames/EscapeGameCard';
import EscapeGameForm from '../../components/escapeGames/EscapeGameForm';

const itemsPerPage = 6;

const ManageEscapeGamePage = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [themeFilter, setThemeFilter] = useState('');
  const [culturalContextFilter, setCulturalContextFilter] = useState('');
  const [sortOption, setSortOption] = useState('');

  const [page, setPage] = useState(1);
  const [editingGame, setEditingGame] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic filter options based on actual data
  const availableThemes = useMemo(() => {
    if (!Array.isArray(games)) return [];
    return [...new Set(games.map(g => g.theme).filter(Boolean))];
  }, [games]);

  const availableCulturalContexts = useMemo(() => {
    if (!Array.isArray(games)) return [];
    return [...new Set(games.map(g => g.culturalContext).filter(Boolean))];
  }, [games]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching games...'); // Debug log
        const fetchedGames = await getAllEscapeGames();
        console.log('Fetched games:', fetchedGames); // Debug log
        
        // Ensure we always have an array
        const gamesArray = Array.isArray(fetchedGames) ? fetchedGames : [];
        console.log('Games array:', gamesArray); // Debug log
        setGames(gamesArray);
      } catch (error) {
        setError('Failed to fetch games');
        toast.error('Failed to fetch games');
        console.error(error);
        setGames([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  useEffect(() => {
    if (!Array.isArray(games)) {
      setFilteredGames([]);
      return;
    }

    let filtered = [...games];

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(game =>
        game.title?.toLowerCase().includes(lower) ||
        game.description?.toLowerCase().includes(lower)
      );
    }

    if (themeFilter) {
      filtered = filtered.filter(game => game.theme === themeFilter);
    }

    if (culturalContextFilter) {
      filtered = filtered.filter(game => game.culturalContext === culturalContextFilter);
    }

    if (sortOption) {
      filtered.sort((a, b) => {
        if (sortOption === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        } else if (sortOption === 'duration') {
          return (a.estimatedDuration || 0) - (b.estimatedDuration || 0);
        } else if (sortOption === 'maxPlayers') {
          return (a.maxPlayers || 0) - (b.maxPlayers || 0);
        }
        return 0;
      });
    }

    setFilteredGames(filtered);
    setPage(1); // Reset to first page when filters change
  }, [games, searchTerm, themeFilter, culturalContextFilter, sortOption]);

  const paginatedGames = useMemo(() => {
    if (!Array.isArray(filteredGames)) return [];
    const start = (page - 1) * itemsPerPage;
    return filteredGames.slice(start, start + itemsPerPage);
  }, [filteredGames, page]);

  const handleAddNew = () => {
    setEditingGame(null);
    setShowForm(true);
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    setShowForm(true);
  };

  const handleDelete = async (gameToDelete) => {
    if (!window.confirm(`Delete game "${gameToDelete.title}"?`)) return;
    try {
      await deleteEscapeGame(gameToDelete._id);
      setGames(prev => Array.isArray(prev) ? prev.filter(g => g._id !== gameToDelete._id) : []);
      toast.success('Game deleted.');
    } catch (err) {
      toast.error('Failed to delete game');
      console.error(err);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingGame) {
        await updateEscapeGame(editingGame._id, data);
        toast.success('Game updated.');
      } else {
        await createEscapeGame(data);
        toast.success('Game added.');
      }

      const refreshedGames = await getAllEscapeGames();
      const gamesArray = Array.isArray(refreshedGames) ? refreshedGames : [];
      setGames(gamesArray);
      setShowForm(false);
      setEditingGame(null);
    } catch (err) {
      toast.error('Failed to save game');
      console.error(err);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGame(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </Box>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Manage Escape Games</h1>
        <Button variant="contained" color="primary" onClick={handleAddNew}>
          + Add New Game
        </Button>
      </div>

      {/* Search + Filters + Sort */}
      <Grid container spacing={2} className="mb-6">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search by title or description"
            variant="outlined"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Theme</InputLabel>
            <Select
              value={themeFilter}
              label="Theme"
              onChange={e => setThemeFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {availableThemes.map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Cultural Context</InputLabel>
            <Select
              value={culturalContextFilter}
              label="Cultural Context"
              onChange={e => setCulturalContextFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {availableCulturalContexts.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortOption}
              label="Sort By"
              onChange={e => setSortOption(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="duration">Duration</MenuItem>
              <MenuItem value="maxPlayers">Max Players</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {paginatedGames.length} of {filteredGames.length} games
      </div>

      {/* Escape Game List */}
      {paginatedGames.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 italic mb-4">
            {games.length === 0 ? 'No games created yet.' : 'No games match your filters.'}
          </p>
          {games.length === 0 && (
            <Button variant="contained" color="primary" onClick={handleAddNew}>
              Create Your First Game
            </Button>
          )}
        </div>
      ) : (
        <Grid container spacing={3}>
          {paginatedGames.map(game => (
            <Grid item xs={12} md={6} lg={4} key={game._id}>
              <div className="relative group border rounded-lg p-4 shadow hover:shadow-lg transition">
                <EscapeGameCard game={game} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-2">
                  <Button size="small" variant="outlined" onClick={() => handleEdit(game)}>
                    Edit
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(game)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {filteredGames.length > itemsPerPage && (
        <div className="flex justify-center mt-6">
          <Pagination
            count={Math.ceil(filteredGames.length / itemsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>{editingGame ? 'Edit Escape Game' : 'Add New Escape Game'}</DialogTitle>
        <DialogContent dividers>
          <EscapeGameForm onSubmit={handleSave} initialData={editingGame} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManageEscapeGamePage;