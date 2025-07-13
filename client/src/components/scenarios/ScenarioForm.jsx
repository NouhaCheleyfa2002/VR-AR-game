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

const ScenarioEditor = ({ initialData = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    historicalTheme: '',
    targetAudience: '',
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        historicalTheme: initialData.historicalTheme || '',
        targetAudience: initialData.targetAudience || '',
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (e) => {
    setFormData(prev => ({ ...prev, isActive: e.target.checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.historicalTheme || !formData.targetAudience) {
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
            name="historicalTheme"
            label="Historical Theme"
            value={formData.historicalTheme}
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

export default ScenarioEditor;
