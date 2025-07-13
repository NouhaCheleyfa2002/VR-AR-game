import React from 'react';
import vrIcon from '../../assets/media/vr-placeholder.png';

const VRPreviewer = ({ url }) => (
  <img src={vrIcon} alt="VR asset" style={{ width: '100%', height: '100%' }} />
);

export default VRPreviewer;