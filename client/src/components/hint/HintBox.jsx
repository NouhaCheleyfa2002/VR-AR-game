import React, { useState } from 'react';
import { motion } from 'framer-motion';

const HintBox = ({ hint, onReveal }) => {
  const [revealed, setRevealed] = useState(hint.isUsed);

  const handleReveal = () => {
    setRevealed(true);
    onReveal?.(hint._id); // Updated to use MongoDB _id
  };

  return (
    <motion.div
      className={`rounded-md p-4 shadow-md transition border-l-4 ${
        revealed
          ? 'border-yellow-500 bg-yellow-50'
          : 'border-gray-400 bg-gray-100 text-gray-500'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-md">
          Hint {hint.hintLevel}
        </h4>
        <span className="text-sm font-medium">
          -{hint.pointDeducted} pts
        </span>
      </div>

      {revealed ? (
        <p className="text-gray-800">{hint.content}</p>
      ) : (
        <button
          onClick={handleReveal}
          className="text-blue-600 hover:underline mt-2"
        >
          Reveal Hint
        </button>
      )}
    </motion.div>
  );
};

export default HintBox;