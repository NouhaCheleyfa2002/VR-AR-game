import React, { useState } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { createPuzzle, updatePuzzle } from '../../api/PuzzleApi'; // Adjust path as needed



const PuzzleEditor = ({ initialData = {}, onSave, onCancel, levelId, isEditing = false }) => {
  const [question, setQuestion] = useState(initialData.question || '');
  const [solution, setSolution] = useState(initialData.solution || '');
  const [difficulty, setDifficulty] = useState(initialData.difficulty || 'Easy');
  const [title, setTitle] = useState(initialData.title || '');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!question.trim()) newErrors.question = 'Question is required';
    if (!solution.trim()) newErrors.solution = 'Solution is required';
    if (!levelId && !initialData.levelId) newErrors.levelId = 'Level ID is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      const puzzleData = {
        title: title.trim(),
        question: question.trim(),
        solution: solution.trim(),
        difficulty,
        levelId: levelId || initialData.levelId,
      };

      let result;
      if (isEditing && initialData._id) {
        // Update existing puzzle
        result = await updatePuzzle(initialData._id, puzzleData);
      } else {
        // Create new puzzle
        result = await createPuzzle(puzzleData);
      }

      // Call the parent's onSave callback with the result
      if (onSave) {
        onSave(result);
      }
    } catch (error) {
      console.error('Error saving puzzle:', error);
      setApiError(
        error.response?.data?.message || 
        error.message || 
        'An error occurred while saving the puzzle'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 600, p: 3 }}
      noValidate
      autoComplete="off"
    >
      <Stack spacing={3}>
        <Typography variant="h6">
          {isEditing ? 'Edit Puzzle' : 'Create New Puzzle'}
        </Typography>

        {apiError && (
          <Alert severity="error" onClose={() => setApiError('')}>
            {apiError}
          </Alert>
        )}

        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={!!errors.title}
          helperText={errors.title}
          fullWidth
          required
          autoFocus
        />

        <TextField
          label="Question"
          multiline
          minRows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          error={!!errors.question}
          helperText={errors.question}
          fullWidth
          required
        />

        <TextField
          label="Solution"
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          error={!!errors.solution}
          helperText={errors.solution}
          fullWidth
          required
        />

        <TextField
          select
          label="Difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          fullWidth
        >
          {difficulties.map((level) => (
            <MenuItem key={level} value={level}>
              {level}
            </MenuItem>
          ))}
        </TextField>

        {/* Display current level ID if available */}
        {(levelId || initialData.levelId) && (
          <TextField
            label="Level ID"
            value={levelId || initialData.levelId}
            disabled
            fullWidth
            helperText="This puzzle will be associated with this level"
          />
        )}

        {/* Placeholder for Scene linking */}
        <Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          Scene linking coming soon...
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button 
            variant="outlined" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            type="submit"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default PuzzleEditor;