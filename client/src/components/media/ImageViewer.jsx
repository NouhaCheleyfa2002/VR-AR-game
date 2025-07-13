import React from 'react';
import { CardMedia } from '@mui/material';

const ImageViewer = ({ url, alt }) => (
  <CardMedia
    component="img"
    image={url}
    alt={alt}
    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
);

export default ImageViewer;