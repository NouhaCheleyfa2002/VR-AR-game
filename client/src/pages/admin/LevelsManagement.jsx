import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { toast } from 'react-toastify';

import LevelCard from '../../components/levels/LevelCard';
import LevelEditor from '../../components/levels/LevelEditor';
import { getAllLevels, deleteLevel } from '../../api/LevelApi';

const difficulties = ['Easy', 'Medium', 'Hard'];

const ManageLevelPage = () => {
  const [levels, setLevels] = useState([]);
  const [filteredLevels, setFilteredLevels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);


  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const levelsData = await getAllLevels();
      console.log('Fetched levels:', levelsData);
      setLevels(levelsData);
    } catch (err) {
      console.error('Error fetching levels:', err);
      setError('Failed to load levels. Please try again.');
      toast.error('Failed to load levels');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = levels;

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(level =>
        level.title?.toLowerCase().includes(lower) ||
        level.description?.toLowerCase().includes(lower) ||
        level.culturalElement?.toLowerCase().includes(lower)
      );
    }
    
    if (difficultyFilter) {
      filtered = filtered.filter(level => level.difficulty === difficultyFilter);
    }
    
    // Sort by level number
    filtered.sort((a, b) => (a.levelNumber || 0) - (b.levelNumber || 0));
    
    setFilteredLevels(filtered);
  }, [levels, searchTerm, difficultyFilter]);

  const openAddModal = () => {
    setEditingLevel(null);
    setIsModalOpen(true);
  };

  const openEditModal = (level) => {
    setEditingLevel(level);
    setIsModalOpen(true);
  };

/*const handleDelete = async (level) => {
    if (!window.confirm(`Are you sure you want to delete "${level.title}"?`)) return;
    
    try {
      await deleteLevel(level._id);
      setLevels(prev => prev.filter(l => l._id !== level._id));
      toast.success('Level deleted successfully');
    } catch (error) {
      console.error('Error deleting level:', error);
      toast.error('Failed to delete level');
    }
  };*/

  const handleSave = (levelData) => {
    if (editingLevel) {
      // Update existing level in the list
      setLevels(prev => prev.map(l => 
        l._id === editingLevel._id ? { ...levelData, _id: editingLevel._id } : l
      ));
      toast.success('Level updated successfully');
    } else {
      // Add new level to the list
      setLevels(prev => [...prev, levelData]);
      toast.success('Level created successfully');
    }
    setIsModalOpen(false);
  };

  const handleLevelUpdate = async (levelId) => {
    // Refresh the specific level or all levels
    try {
      const updatedLevels = await getAllLevels();
      setLevels(updatedLevels);
    } catch (error) {
      console.error('Error refreshing levels:', error);
      toast.error('Failed to refresh levels');
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="contained" onClick={fetchLevels}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Levels</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-6">
        <TextField
          placeholder="Search by title, description, or cultural element..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: { xs: 2, md: 0 }, flex: 1 }}
        />

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel id="difficulty-select-label">Filter by Difficulty</InputLabel>
          <Select
            labelId="difficulty-select-label"
            value={difficultyFilter}
            label="Filter by Difficulty"
            onChange={e => setDifficultyFilter(e.target.value)}
            size="small"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {difficulties.map(diff => (
              <MenuItem key={diff} value={diff}>{diff}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={openAddModal}
          sx={{ ml: 'auto', mt: { xs: 2, md: 0 } }}
        >
          + Add Level
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-gray-600">
            Total Levels: <strong>{levels.length}</strong>
          </span>
          <span className="text-gray-600">
            Filtered: <strong>{filteredLevels.length}</strong>
          </span>
          <span className="text-green-600">
            Easy: <strong>{levels.filter(l => l.difficulty === 'Easy').length}</strong>
          </span>
          <span className="text-yellow-600">
            Medium: <strong>{levels.filter(l => l.difficulty === 'Medium').length}</strong>
          </span>
          <span className="text-red-600">
            Hard: <strong>{levels.filter(l => l.difficulty === 'Hard').length}</strong>
          </span>
        </div>
      </div>

      {/* Level List */}
      {filteredLevels.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 italic mb-4">
            {searchTerm || difficultyFilter ? 'No levels match your filters.' : 'No levels found.'}
          </p>
          {!searchTerm && !difficultyFilter && (
            <Button variant="contained" onClick={openAddModal}>
              Create Your First Level
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLevels.map(level => (
            <LevelCard
              key={level._id}
              level={level}
              onEdit={openEditModal}
              onLevelUpdate={handleLevelUpdate}
            />
          ))}
        </div>
      )}

      {/* Level Editor Modal */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          {editingLevel ? 'Edit Level' : 'Add New Level'}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <LevelEditor
            initialData={editingLevel}
            onCancel={() => setIsModalOpen(false)}
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageLevelPage;