import React from 'react';
import MultiplayerRoomCard from './MultiplayerRoomCard';

const MultiplayerRoomList = ({ rooms, onDeleteRoom, showActions = false }) => {
  if (!rooms || rooms.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
          <p className="text-sm text-gray-500">
            There are currently no multiplayer rooms to display.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{rooms.length}</div>
            <div className="text-gray-600">Total Rooms</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {rooms.filter(room => room.roomStatus === 'Active' || room.status === 'Active').length}
            </div>
            <div className="text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {rooms.filter(room => room.roomStatus === 'Waiting' || room.status === 'Waiting').length}
            </div>
            <div className="text-gray-600">Waiting</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {rooms.reduce((total, room) => total + (room.participants?.length || 0), 0)}
            </div>
            <div className="text-gray-600">Total Players</div>
          </div>
        </div>
      </div>

      {/* Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((room) => (
          <MultiplayerRoomCard 
            key={room.roomId || room._id} 
            room={room} 
            onDeleteRoom={onDeleteRoom}
            showActions={showActions}
          />
        ))}
      </div>
    </div>
  );
};

export default MultiplayerRoomList;