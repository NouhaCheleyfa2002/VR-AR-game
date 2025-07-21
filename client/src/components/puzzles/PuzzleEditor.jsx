import React, { useState, useEffect } from 'react';
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

const difficulties = ['Easy', 'Medium', 'Hard'];

const PuzzleEditor = ({ 
  initialData = {}, 
  onSave, 
  onCancel, 
  loading = false, 
  isEditing = false,
  levels = [] // Add levels prop
}) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [question, setQuestion] = useState(initialData.question || '');
  const [solution, setSolution] = useState(initialData.solution || '');
  const [difficulty, setDifficulty] = useState(initialData.difficulty || 'Easy');
  const [levelId, setLevelId] = useState(initialData.levelId?._id || initialData.levelId || '');
  const [errors, setErrors] = useState({});

  // Reset form when initialData changes (for editing)
  useEffect(() => {
    setTitle(initialData.title || '');
    setQuestion(initialData.question || '');
    setSolution(initialData.solution || '');
    setDifficulty(initialData.difficulty || 'Easy');
    setLevelId(initialData.levelId?._id || initialData.levelId || '');
    setErrors({});
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }
    
    if (!question.trim()) {
      newErrors.question = 'Question is required';
    } else if (question.trim().length < 10) {
      newErrors.question = 'Question must be at least 10 characters long';
    }
    
    if (!solution.trim()) {
      newErrors.solution = 'Solution is required';
    } else if (solution.trim().length < 3) {
      newErrors.solution = 'Solution must be at least 3 characters long';
    }

    if (!difficulties.includes(difficulty)) {
      newErrors.difficulty = 'Please select a valid difficulty level';
    }

    if (!levelId) {
      newErrors.levelId = 'Please select a level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    const puzzleData = {
      title: title.trim(),
      question: question.trim(),
      solution: solution.trim(),
      difficulty: difficulty,
      levelId: levelId,
    };

    try {
      if (onSave) {
        await onSave(puzzleData);
      }
    } catch (error) {
      console.error('Error in PuzzleEditor handleSubmit:', error);
      // Set a general error that can be displayed
      setErrors({ general: 'Failed to save puzzle. Please try again.' });
    }
  };

  const handleCancel = () => {
    // Reset form
    setTitle(initialData.title || '');
    setQuestion(initialData.question || '');
    setSolution(initialData.solution || '');
    setDifficulty(initialData.difficulty || 'Easy');
    setLevelId(initialData.levelId?._id || initialData.levelId || '');
    setErrors({});
    
    if (onCancel) {
      onCancel();
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
        {/* Display general errors */}
        {errors.general && (
          <Alert severity="error" onClose={() => setErrors({ ...errors, general: null })}>
            {errors.general}
          </Alert>
        )}

        <TextField
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            // Clear error when user starts typing
            if (errors.title) {
              setErrors({ ...errors, title: null });
            }
          }}
          error={!!errors.title}
          helperText={errors.title}
          fullWidth
          required
          autoFocus
          disabled={loading}
        />

        <TextField
          label="Question"
          multiline
          minRows={3}
          maxRows={6}
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            // Clear error when user starts typing
            if (errors.question) {
              setErrors({ ...errors, question: null });
            }
          }}
          error={!!errors.question}
          helperText={errors.question}
          fullWidth
          required
          disabled={loading}
        />

        <TextField
          label="Solution"
          multiline
          minRows={2}
          maxRows={4}
          value={solution}
          onChange={(e) => {
            setSolution(e.target.value);
            // Clear error when user starts typing
            if (errors.solution) {
              setErrors({ ...errors, solution: null });
            }
          }}
          error={!!errors.solution}
          helperText={errors.solution}
          fullWidth
          required
          disabled={loading}
        />

        <TextField
          select
          label="Difficulty"
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            // Clear error when user makes selection
            if (errors.difficulty) {
              setErrors({ ...errors, difficulty: null });
            }
          }}
          error={!!errors.difficulty}
          helperText={errors.difficulty}
          fullWidth
          required
          disabled={loading}
        >
          {difficulties.map((level) => (
            <MenuItem key={level} value={level}>
              {level}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Level"
          value={levelId}
          onChange={(e) => {
            setLevelId(e.target.value);
            // Clear error when user makes selection
            if (errors.levelId) {
              setErrors({ ...errors, levelId: null });
            }
          }}
          error={!!errors.levelId}
          helperText={errors.levelId || 'Select the level this puzzle belongs to'}
          fullWidth
          required
          disabled={loading}
        >
          {levels.map((level) => (
            <MenuItem key={level._id} value={level._id}>
              Level {level.levelNumber}: {level.title}
            </MenuItem>
          ))}
        </TextField>

        {/* Placeholder for Scene linking */}
        <Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          Scene linking coming soon...
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default PuzzleEditor;