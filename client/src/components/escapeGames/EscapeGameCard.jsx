import React from 'react';
import { FaClock, FaUsers } from 'react-icons/fa';
import { MdEdit, MdDelete } from 'react-icons/md';

const EscapeGameCard = ({ game, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition border border-gray-200 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-blue-700">{game.title}</h3>
          <p className="text-sm text-gray-500">{game.theme} • {game.culturalContext}</p>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            game.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {game.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <p className="text-gray-700 text-sm line-clamp-3">
        {game.description}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <FaClock className="text-blue-500" />
            {game.estimatedDuration} min
          </span>
          <span className="flex items-center gap-1">
            <FaUsers className="text-blue-500" />
            {game.maxPlayers} players
          </span>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(game)}
                className="text-blue-600 hover:text-blue-800"
                title="Edit"
              >
                <MdEdit size={20} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(game)}
                className="text-red-600 hover:text-red-800"
                title="Delete"
              >
                <MdDelete size={20} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EscapeGameCard;
