import React, { useState } from 'react';
import { 
  Users, 
  Gamepad2, 
  KeyRound, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Edit,
  QrCode,
  Clock,
  Crown
} from 'lucide-react';

const MultiplayerRoomCard = ({ room, onDeleteRoom, showActions = false }) => {
  const [showParticipants, setShowParticipants] = useState(false);

  // Format date helper
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow p-5 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-gray-800">
          Room #{room.roomId || room._id}
        </h2>
        <div className="flex items-center space-x-2">
          <div
            className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(room.roomStatus || room.status)}`}
          >
            {room.roomStatus || room.status}
          </div>
          
          {/* Admin Actions */}
          {showActions && (
            <div className="flex space-x-1">
              <button
                onClick={() => onDeleteRoom(room.roomId || room._id)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
                title="Delete Room"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Room Info Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mb-3">
        <div className="flex items-center space-x-2">
          <Gamepad2 className="w-4 h-4 text-indigo-500" />
          <span>Game ID:</span>
          <span className="font-medium text-gray-900">{room.gameId || 'N/A'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-indigo-500" />
          <span>Players:</span>
          <span className="font-medium text-gray-900">
            {room.participants?.length || 0} / {room.maxPlayers || 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <KeyRound className="w-4 h-4 text-indigo-500" />
          <span>Access Code:</span>
          <span className="font-mono text-gray-900">{room.accessCode || 'N/A'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <QrCode className="w-4 h-4 text-indigo-500" />
          <span>QR Generated:</span>
          <span className={`font-semibold ${room.qrCode ? 'text-green-600' : 'text-red-500'}`}>
            {room.qrCode ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      {/* Created/Updated timestamps */}
      {(room.createdAt || room.updatedAt) && (
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-3">
          {room.createdAt && (
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>Created: {formatDate(room.createdAt)}</span>
            </div>
          )}
          {room.updatedAt && (
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>Updated: {formatDate(room.updatedAt)}</span>
            </div>
          )}
        </div>
      )}

      {/* Toggle Participants */}
      <button
        onClick={() => setShowParticipants(!showParticipants)}
        className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
      >
        {showParticipants ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        <span>
          {showParticipants ? 'Hide' : 'Show'} Participants 
          {room.participants?.length ? ` (${room.participants.length})` : ''}
        </span>
      </button>

      {/* Participants List */}
      {showParticipants && (
        <div className="mt-3 space-y-2 text-sm bg-gray-50 p-3 rounded">
          {room.participants && room.participants.length > 0 ? (
            room.participants.map((participant, index) => (
              <div
                key={participant._id || index}
                className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-b-0"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700 font-medium">
                    participant ID: {room.participants}
                  </span>
                  {participant.isHost && (
                    <Crown className="w-4 h-4 text-yellow-500" title="Host" />
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    participant.isReady 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {participant.isReady ? 'Ready' : 'Waiting'}
                  </span>
                  
                  {participant.joinedAt && (
                    <span className="text-xs text-gray-500">
                      Joined: {formatDate(participant.joinedAt)}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-2">
              No participants yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiplayerRoomCard;