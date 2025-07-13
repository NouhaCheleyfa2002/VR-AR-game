import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Stack,
  Typography,
  Box,
  Alert,
} from '@mui/material';

const GameplaySessionForm = ({ session, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    _id: session?._id || null,
    playerId: session?.playerId || '',
    roomId: session?.roomId || '',
    gameId: session?.gameId || '',
    startTime: session?.startTime
      ? new Date(session.startTime).toISOString().slice(0, 16)
      : '',
    endTime: session?.endTime
      ? new Date(session.endTime).toISOString().slice(0, 16)
      : '',
    totalScore: session?.totalScore || 0,
    hintsUsed: session?.hintsUsed || 0,
    completionRate: session?.completionRate || '',
    errorRate: session?.errorRate || '',
    avgSolveTime: session?.avgSolveTime || '',
    preferredDifficulty: session?.preferredDifficulty || '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (session) {
      setFormData({
        _id: session._id,
        playerId: session.playerId || '',
        roomId: session.roomId || '',
        gameId: session.gameId || '',
        startTime: session.startTime
          ? new Date(session.startTime).toISOString().slice(0, 16)
          : '',
        endTime: session.endTime
          ? new Date(session.endTime).toISOString().slice(0, 16)
          : '',
        totalScore: session.totalScore || 0,
        hintsUsed: session.hintsUsed || 0,
        completionRate: session.completionRate || '',
        errorRate: session.errorRate || '',
        avgSolveTime: session.avgSolveTime || '',
        preferredDifficulty: session.preferredDifficulty || '',
      });
    }
  }, [session]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.playerId.trim()) {
      newErrors.playerId = 'Player ID is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (formData.endTime && formData.startTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (formData.totalScore < 0) {
      newErrors.totalScore = 'Total score cannot be negative';
    }

    if (formData.hintsUsed < 0) {
      newErrors.hintsUsed = 'Hints used cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Apply custom validation for numeric fields
    if (name === 'totalScore' || name === 'hintsUsed') {
      const num = Number(value);
      setFormData((fd) => ({
        ...fd,
        [name]: num < 0 ? 0 : num,
      }));
    } else {
      setFormData((fd) => ({
        ...fd,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      ...formData,
      startTime: formData.startTime ? new Date(formData.startTime) : null,
      endTime: formData.endTime ? new Date(formData.endTime) : null,
      // Convert numeric strings to numbers or null
      completionRate: formData.completionRate ? Number(formData.completionRate) : null,
      errorRate: formData.errorRate ? Number(formData.errorRate) : null,
      avgSolveTime: formData.avgSolveTime ? Number(formData.avgSolveTime) : null,
    };

    onSave(payload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500 }}>
      <Typography variant="h6" mb={2}>
        {session ? 'Edit' : 'New'} Gameplay Session
      </Typography>

      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Please fix the errors below before submitting.
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          label="Player ID"
          name="playerId"
          value={formData.playerId}
          onChange={handleChange}
          required
          error={!!errors.playerId}
          helperText={errors.playerId}
        />
        
        <TextField
          label="Room ID"
          name="roomId"
          value={formData.roomId}
          onChange={handleChange}
          error={!!errors.roomId}
          helperText={errors.roomId}
        />
        
        <TextField
          label="Game ID"
          name="gameId"
          value={formData.gameId}
          onChange={handleChange}
          error={!!errors.gameId}
          helperText={errors.gameId}
        />
        
        <TextField
          label="Start Time"
          type="datetime-local"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
          error={!!errors.startTime}
          helperText={errors.startTime}
        />
        
        <TextField
          label="End Time"
          type="datetime-local"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          error={!!errors.endTime}
          helperText={errors.endTime}
        />
        
        <TextField
          label="Total Score"
          name="totalScore"
          type="number"
          value={formData.totalScore}
          onChange={handleChange}
          error={!!errors.totalScore}
          helperText={errors.totalScore || "Score must be 0 or higher"}
          inputProps={{ min: 0 }}
        />
        
        <TextField
          label="Hints Used"
          name="hintsUsed"
          type="number"
          value={formData.hintsUsed}
          onChange={handleChange}
          error={!!errors.hintsUsed}
          helperText={errors.hintsUsed || "Cannot be negative"}
          inputProps={{ min: 0 }}
        />

        <TextField
          label="Completion Rate (%)"
          name="completionRate"
          type="number"
          value={formData.completionRate}
          onChange={handleChange}
          helperText="Optional: Percentage of game completed"
          inputProps={{ min: 0, max: 100, step: 0.1 }}
        />

        <TextField
          label="Error Rate (%)"
          name="errorRate"
          type="number"
          value={formData.errorRate}
          onChange={handleChange}
          helperText="Optional: Percentage of errors made"
          inputProps={{ min: 0, max: 100, step: 0.1 }}
        />

        <TextField
          label="Average Solve Time (seconds)"
          name="avgSolveTime"
          type="number"
          value={formData.avgSolveTime}
          onChange={handleChange}
          helperText="Optional: Average time to solve problems"
          inputProps={{ min: 0, step: 0.1 }}
        />

        <TextField
          label="Preferred Difficulty"
          name="preferredDifficulty"
          value={formData.preferredDifficulty}
          onChange={handleChange}
          helperText="Optional: e.g., Easy, Medium, Hard"
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" color="primary">
            {session ? 'Update' : 'Create'} Session
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default GameplaySessionForm;