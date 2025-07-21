import React, { useState, useMemo, useEffect } from 'react';
import PuzzleEditor from '../../components/puzzles/PuzzleEditor';
import PuzzleCard from '../../components/puzzles/PuzzleCard';
import {
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Typography,
  Box,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { MdDelete } from 'react-icons/md';
import { Pagination } from '@mui/material';
import {
  getAllPuzzles,
  createPuzzle,
  updatePuzzle,
  deletePuzzle,
} from '../../api/PuzzleApi';

// You'll need to create this API call or import it
import { getAllLevels } from '../../api/LevelApi'; // Adjust import path as needed

const ManagePuzzlePage = () => {
  const [puzzles, setPuzzles] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selected, setSelected] = useState([]);

  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [actionLoading, setActionLoading] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchPuzzles();
    fetchLevels();
  }, []);

  const fetchPuzzles = async () => {
    try {
      setLoading(true);
      const data = await getAllPuzzles();
      setPuzzles(data);
      setSnackbar({ open: true, message: 'Puzzles loaded successfully', severity: 'success' });
    } catch (error) {
      console.error('Error loading puzzles:', error);
      setSnackbar({ open: true, message: 'Failed to load puzzles', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async () => {
    try {
      const data = await getAllLevels();
      setLevels(data);
    } catch (error) {
      console.error('Error loading levels:', error);
      setSnackbar({ open: true, message: 'Failed to load levels', severity: 'error' });
    }
  };

  const filteredPuzzles = useMemo(() => {
    let list = [...puzzles];

    if (search) {
      list = list.filter((p) => 
        p.question.toLowerCase().includes(search.toLowerCase()) ||
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filter) {
      list = list.filter((p) => p.difficulty === filter);
    }
    if (sort === 'difficulty') {
      list.sort((a, b) => a.difficulty.localeCompare(b.difficulty));
    } else if (sort === 'alphabetical') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [puzzles, search, filter, sort]);

  const paginated = filteredPuzzles.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleSave = async (puzzleData) => {
    try {
      setActionLoading(true);
      
      if (editingPuzzle) {
        // Update existing puzzle
        const updatedPuzzle = await updatePuzzle(editingPuzzle._id, puzzleData);
        setPuzzles((prev) =>
          prev.map((p) => (p._id === editingPuzzle._id ? updatedPuzzle : p))
        );
        setSnackbar({ open: true, message: 'Puzzle updated successfully', severity: 'success' });
      } else {
        // Create new puzzle
        const newPuzzle = await createPuzzle(puzzleData);
        
        setPuzzles((prev) => [...prev, newPuzzle]);
        setSnackbar({ open: true, message: 'Puzzle created successfully', severity: 'success' });
      }
      
      setEditorOpen(false);
      setEditingPuzzle(null);
    } catch (error) {
      console.error('Error saving puzzle:', error);
      setSnackbar({ 
        open: true, 
        message: `Failed to ${editingPuzzle ? 'update' : 'create'} puzzle`, 
        severity: 'error' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(true);
      
      await deletePuzzle(id);
     
      setPuzzles((prev) => prev.filter((p) => p._id !== id));
      setSnackbar({ open: true, message: 'Puzzle deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting puzzle:', error);
      setSnackbar({ open: true, message: 'Failed to delete puzzle', severity: 'error' });
    } finally {
      setActionLoading(false);
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
      <Box className="max-w-5xl mx-auto p-6 text-center">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading puzzles...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="max-w-5xl mx-auto p-6">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h5">Puzzle Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setEditorOpen(true)}
          disabled={actionLoading}
        >
          Add Puzzle
        </Button>
      </Box>

      <Box className="flex gap-4 flex-wrap mb-6">
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="small"
          placeholder="Search by title or question"
        />
        <FormControl size="small">
          <InputLabel>Difficulty</InputLabel>
          <Select
            label="Difficulty"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Easy">Easy</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Hard">Hard</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Sort</InputLabel>
          <Select
            label="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="alphabetical">Alphabetical</MenuItem>
            <MenuItem value="difficulty">By Difficulty</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {puzzles.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No puzzles found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Click "Add Puzzle" to create your first puzzle
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {paginated.map((puzzle) => (
            <Grid item xs={12} sm={6} md={4} key={puzzle._id}>
              <Box position="relative">
                <PuzzleCard
                  puzzle={puzzle}
                  onEdit={() => {
                    setEditingPuzzle(puzzle);
                    setEditorOpen(true);
                  }}
                />
                <Checkbox
                  checked={selected.includes(puzzle._id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelected((prev) =>
                      checked ? [...prev, puzzle._id] : prev.filter((id) => id !== puzzle._id)
                    );
                  }}
                  sx={{ position: 'absolute', top: 8, left: 8 }}
                />

                <IconButton
                  onClick={() => setConfirmDelete(puzzle._id)}
                  sx={{ position: 'absolute', top: 8, right: 8, color: 'red' }}
                  disabled={actionLoading}
                >
                  <MdDelete />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* PuzzleEditor Modal */}
      <Dialog
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingPuzzle(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingPuzzle ? 'Edit Puzzle' : 'Add Puzzle'}</DialogTitle>
        <DialogContent dividers>
          <PuzzleEditor
            initialData={editingPuzzle || {
              title: '',
              question: '',
              solution: '',
              difficulty: 'Easy',
              levelId: '',
            }}
            levels={levels}
            onSave={handleSave}
            onCancel={() => {
              setEditorOpen(false);
              setEditingPuzzle(null);
            }}
            loading={actionLoading}
            isEditing={!!editingPuzzle}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDelete === 'bulk' 
              ? `Are you sure you want to delete ${selected.length} selected puzzles?`
              : 'Are you sure you want to delete this puzzle?'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={() => {
              handleDelete(confirmDelete);
              setConfirmDelete(null);
            }}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pagination */}
      {filteredPuzzles.length > itemsPerPage && (
        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={Math.ceil(filteredPuzzles.length / itemsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
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
    </Box>
  );
};

export default ManagePuzzlePage;