import React from 'react';

const SceneInteraction = ({ onInteract }) => {
  return (
    <button onClick={onInteract}>Interact with Scene</button>
  );
};

export default SceneInteraction;
