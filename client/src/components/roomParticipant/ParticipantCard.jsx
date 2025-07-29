import React, { useState } from 'react';
import { User } from 'lucide-react';
import ParticipantStatus from './ParticipantStatus';
import { toggleParticipantReady } from '../../api/RoomParticipant'; 

// ParticipantCard Component
const ParticipantCard = ({
  participant,
  playerName,
  isCurrentUser = false,
  onReadyToggle = null,
  showActions = true,
  onParticipantUpdate = null 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localParticipant, setLocalParticipant] = useState(participant);

  // Check if participant is just a string ID or full object
  const isStringId = typeof localParticipant === 'string';
  
  // Extract player name from participant data
  const displayPlayerName = playerName || 
    (!isStringId && localParticipant?.playerId?.userName) || 
    `Player ${isStringId ? localParticipant.slice(-4) : localParticipant?._id?.slice(-4)}`;

  const handleReadyToggle = async () => {
    if (isStringId || !localParticipant?._id) {
      console.error('Cannot toggle ready status: Invalid participant data');
      return;
    }
    
    setIsLoading(true);
    try {
      // Call the API to toggle ready status
      const response = await toggleParticipantReady(localParticipant._id);
      
      if (response.success) {
        // Update local state with the new participant data
        setLocalParticipant(response.data);
        
        // Call the parent callback if provided - PASS BOTH PARTICIPANT AND FULL RESPONSE
        if (onReadyToggle) {
          onReadyToggle(response.data, response); // Pass both updated participant and full response
        }
        
        // Call the update callback if provided
        if (onParticipantUpdate) {
          onParticipantUpdate(response.data, response); // Also pass full response here
        }
        
      } else {
        throw new Error(response.message || 'Failed to toggle ready status');
      }
    } catch (error) {
      console.error('Failed to update ready status:', error);
      // You might want to show a toast notification or error message here
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`
      bg-white rounded-lg shadow-md border-2 transition-all duration-200
      ${!isStringId && localParticipant?.isReady ? 'border-green-200 bg-green-50' : 'border-gray-200'}
      ${isCurrentUser ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
      hover:shadow-lg
    `}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${!isStringId && localParticipant?.isReady ? 'bg-green-100' : 'bg-gray-100'}
            `}>
              <User className={`w-5 h-5 ${!isStringId && localParticipant?.isReady ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {displayPlayerName}
                {isCurrentUser && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    You
                  </span>
                )}
                {!isStringId && localParticipant?.isHost && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Host
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-500">
                {!isStringId && localParticipant?.playerId?.email ? 
                  localParticipant.playerId.email : 
                  `Participant ID: ${isStringId ? localParticipant : localParticipant?._id}`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Player Details - Only show if not string ID */}
        {!isStringId && (
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Score:</span>
              <span className="font-medium">{localParticipant?.playerId?.score || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Joined:</span>
              <span className="font-medium">
                {localParticipant?.joinedAt ? new Date(localParticipant.joinedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${localParticipant?.isReady ? 'text-green-600' : 'text-yellow-600'}`}>
                {localParticipant?.isReady ? 'Ready' : 'Not Ready'}
              </span>
            </div>
          </div>
        )}

        {/* Status Component */}
        <div className="mb-4">
          <ParticipantStatus participant={localParticipant} />
        </div>

        {/* Actions */}
        {showActions && isCurrentUser && !isStringId && (
          <div className="flex space-x-2 mb-3">
            <button
              onClick={handleReadyToggle}
              disabled={isLoading}
              className={`
                flex-1 px-4 py-2 rounded-md font-medium transition-colors duration-200
                ${localParticipant?.isReady
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
                localParticipant?.isReady ? 'Mark Not Ready' : 'Mark Ready'
              )}
            </button>
          </div>
        )}

        {/* Room Info */}
        <div className="pt-3 border-t border-gray-100">
          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Room ID:</span>
              <span className="font-mono">{localParticipant?.roomId?._id || localParticipant?.roomId || 'N/A'}</span>
            </div>             
          </div>         
        </div>
      </div>
    </div>
  );
};

export default ParticipantCard;