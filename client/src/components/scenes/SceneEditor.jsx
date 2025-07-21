// components/scenes/SceneEditor.jsx
import React, { useState } from 'react';
import {
  TextField,
  Typography,
  Box,
  Grid,
  Stack,
  Divider,
  Button
} from '@mui/material';
import MediaUploader from '../media/MediaUploader';
import MediaViewer from '../media/MediaViewer';

const MEDIA_TYPES = ['image', 'video', 'audio', 'vr', 'ar'];

const SceneEditor = ({ initialScene = {}, onSave }) => {
  const [scene, setScene] = useState({
    title: initialScene.title || '',
    description: initialScene.description || '',
    media: initialScene.media || [],
  });

  const handleMediaUpload = (files, type) => {
    const newMedia = files.map((file) => ({
      type,
      url: URL.createObjectURL(file), // Temporary preview URL
      file,
    }));
    setScene((prev) => ({
      ...prev,
      media: [...prev.media, ...newMedia],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setScene((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Optional: convert File objects to FormData or base64 if saving to backend
    if (onSave) onSave(scene);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Edit Scene</Typography>

      <Stack spacing={2}>
        <TextField
          label="Title"
          name="title"
          fullWidth
          value={scene.title}
          onChange={handleChange}
        />
        <TextField
          label="Description"
          name="description"
          fullWidth
          multiline
          rows={4}
          value={scene.description}
          onChange={handleChange}
        />

        <Divider />
        <Typography variant="h6">Upload Media</Typography>
        <Grid container spacing={2}>
          {MEDIA_TYPES.map((type) => (
            <Grid item key={type}>
              <MediaUploader type={type} onFilesSelected={handleMediaUpload} />
            </Grid>
          ))}
        </Grid>

        <Divider />
        <Typography variant="h6">Preview Media</Typography>
        <MediaViewer mediaList={scene.media} />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Save Scene
        </Button>
      </Stack>
    </Box>
  );
};

export default SceneEditor;
