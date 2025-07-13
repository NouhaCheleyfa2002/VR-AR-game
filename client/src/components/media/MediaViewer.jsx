import React from 'react';
import ImageViewer from './ImageViewer';
import VideoViewer from './VideoViewer';
import AudioViewer from './AudioViewer';
import ARPreviewer from './ARPreviewer';
import VRPreviewer from './VRPreviewer';

const MediaViewer = ({ media }) => {
  switch (media.type) {
    case 'image':
      return <ImageViewer url={media.url} alt={media.description} />;
    case 'video':
      return <VideoViewer url={media.url} />;
    case 'audio':
      return <AudioViewer url={media.url} />;
    case 'ar':
      return <ARPreviewer url={media.url} />;
    case 'vr':
      return <VRPreviewer url={media.url} />;
    default:
      return <div>Unsupported media type</div>;
  }
};

export default MediaViewer;