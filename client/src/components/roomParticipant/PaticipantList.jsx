// components/roomParticipants/ParticipantList.jsx
import React from 'react';
import ParticipantCard from './ParticipantCard';

const ParticipantList = ({ participants, currentPlayerId, onReadyToggle }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {participants.map((participant) => (
        <ParticipantCard
          key={participant.participantId}
          participant={participant}
          playerName={`Player ${participant.playerId}`}
          isCurrentUser={participant.playerId === currentPlayerId}
          onReadyToggle={onReadyToggle}
        />
      ))}
    </div>
  );
};

export default ParticipantList;
