import React from 'react';
import { CircleCheck, Clock, XCircle } from 'lucide-react';

const ParticipantStatus = ({ participant }) => {
  const { isReady } = participant;

  if (isReady) {
    return (
      <div className="flex items-center space-x-2 text-green-700 font-medium">
        <CircleCheck className="w-4 h-4" />
        <span>Ready</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-yellow-700 font-medium">
      <Clock className="w-4 h-4" />
      <span>Waiting...</span>
    </div>
  );
};

export default ParticipantStatus;
