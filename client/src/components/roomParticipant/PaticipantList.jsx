import React from 'react';
import ParticipantCard from './ParticipantCard';

const ParticipantList = ({ 
  participants, 
  currentPlayerId, 
  onReadyToggle,
  onParticipantUpdate 
}) => {
  
  // Handle the ready toggle with proper data extraction
  const handleReadyToggle = (updatedParticipant, toggleResponse) => {
    // Extract room ID from the updated participant
    const roomId = updatedParticipant?.roomId?._id || updatedParticipant?.roomId;
    
    // Call the parent callback with the necessary data
    if (onReadyToggle) {
      onReadyToggle(updatedParticipant, toggleResponse, roomId);
    }
  };

  // Handle participant updates (optional)
  const handleParticipantUpdate = (updatedParticipant, response) => {
    if (onParticipantUpdate) {
      onParticipantUpdate(updatedParticipant, response);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {participants.map((participant, index) => (
        <ParticipantCard
          key={participant._id || `participant-${index}`}
          participant={participant}
          playerName={participant.playerId?.userName || `Player ${index + 1}`}
          isCurrentUser={participant.playerId?._id === currentPlayerId}
          onReadyToggle={handleReadyToggle}
          onParticipantUpdate={handleParticipantUpdate}
        />
      ))}
    </div>
  );
};

export default ParticipantList;