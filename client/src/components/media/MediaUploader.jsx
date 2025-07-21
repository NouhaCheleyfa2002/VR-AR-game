import React from 'react';
import { Button } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { getAcceptType } from './MediaType';

const MediaUploader = ({ type, onFilesSelected }) => {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    onFilesSelected(files, type);
  };

  return (
    <Button
      component="label"
      variant="outlined"
      startIcon={<AddPhotoAlternateIcon />}
    >
      {type.toUpperCase()}
      <input
        type="file"
        accept={getAcceptType(type)}
        hidden
        multiple
        onChange={handleFileChange}
      />
    </Button>
  );
};

export default MediaUploader;