import React from 'react';

const VideoViewer = ({ url }) => (
  <video width="100%" height="100%" controls>
    <source src={url} type="video/mp4" />
    Your browser does not support the video tag.
  </video>
);

export default VideoViewer;