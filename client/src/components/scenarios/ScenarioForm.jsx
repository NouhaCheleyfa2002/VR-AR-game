import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Box,
  Grid,
  Typography,
} from '@mui/material';

const ScenarioForm = ({ initialData = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    gameId:'',
    title: '',
    theme: '',
    targetAudience: '',
    isActive: true,
    levels: [],
    
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        gameId: initialData.gameId?._id || initialData.gameId || '',
        title: initialData.title || '',
        theme: initialData.theme || '',
        targetAudience: initialData.targetAudience || '',
        isActive: initialData.isActive ?? true,
        levels: Array.isArray(initialData.levels)
        ? initialData.levels.map(level => (typeof level === 'object' ? level._id : level))
        : [],

      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === 'levels') {
      setFormData(prev => ({
        ...prev,
        levels: value.split(',').map(id => id.trim()),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  

  const handleToggle = (e) => {
    setFormData(prev => ({ ...prev, isActive: e.target.checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.gameId || !formData.title || !formData.theme || !formData.levels || !formData.targetAudience) 
      {
      alert('Please fill all required fields.');
      return;
    }
    
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" mb={2}>
        {initialData ? 'Edit Scenario' : 'Create New Scenario'}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            name="gameId"
            label="game Id"
            value={formData.gameId}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="title"
            label="Scenario Title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="theme"
            label="historical Theme"
            value={formData.theme}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            name="targetAudience"
            label="Target Audience"
            value={formData.targetAudience}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="levels"
            label="levels"
            value={formData.levels.join(', ')}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleToggle}
                color="primary"
              />
            }
            label="Active"
          />
        </Grid>
      </Grid>

      <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Save Scenario
        </Button>
      </Box>
    </form>
  );
};

export default ScenarioForm;
