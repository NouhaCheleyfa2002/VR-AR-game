import React, { useState} from 'react';
import { User} from 'lucide-react';
import ParticipantStatus from './ParticipantStatus';

// ParticipantCard Component
const ParticipantCard = ({ 
  participant, 
  playerName = `Player ${participant.playerId}`,
  isCurrentUser = false,
  onReadyToggle = null,
  showActions = true 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleReadyToggle = async () => {
    if (!onReadyToggle) return;
    
    setIsLoading(true);
    try {
      await participant.syncParticipantProgress();
      participant.setReady(!participant.isReady);
      onReadyToggle(participant);
    } catch (error) {
      console.error('Failed to update ready status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`
      bg-white rounded-lg shadow-md border-2 transition-all duration-200
      ${participant.isReady ? 'border-green-200 bg-green-50' : 'border-gray-200'}
      ${isCurrentUser ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
      hover:shadow-lg
    `}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${participant.isReady ? 'bg-green-100' : 'bg-gray-100'}
            `}>
              <User className={`w-5 h-5 ${participant.isReady ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {playerName}
                {isCurrentUser && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    You
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-500">ID: {participant.participantId}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mb-4">
          <ParticipantStatus participant={participant} />
        </div>

        {/* Actions */}
        {showActions && isCurrentUser && (
          <div className="flex space-x-2">
            <button
              onClick={handleReadyToggle}
              disabled={isLoading}
              className={`
                flex-1 px-4 py-2 rounded-md font-medium transition-colors duration-200
                ${participant.isReady
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </span>
              ) : (
                participant.isReady ? 'Mark Not Ready' : 'Mark Ready'
              )}
            </button>
          </div>
        )}

        {/* Room Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Room: {participant.roomId}</span>
            <span>Player: {participant.playerId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantCard;