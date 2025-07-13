import React from 'react';

const AudioViewer = ({ url }) => (
  <audio controls style={{ width: '100%' }}>
    <source src={url} type="audio/mpeg" />
    Your browser does not support the audio tag.
  </audio>
);

export default AudioViewer;