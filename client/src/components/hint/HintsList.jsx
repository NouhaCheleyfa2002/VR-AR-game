import React, { useState } from 'react';
import HintBox from './HintBox';
import { motion, AnimatePresence } from 'framer-motion';

const HintsList = ({ hints = [], onReveal }) => {
  const [showUsed, setShowUsed] = useState(true);
  const usedHints = hints.filter((hint) => hint.isUsed);
  const unusedHints = hints.filter((hint) => !hint.isUsed);

  const totalHints = hints.length;
  const usedCount = usedHints.length;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          Hints ({usedCount}/{totalHints} used)
        </h3>
        <button
          onClick={() => setShowUsed(!showUsed)}
          className="text-sm text-blue-600 hover:underline"
        >
          {showUsed ? 'Hide used hints' : 'Show used hints'}
        </button>
      </div>

      <div className="space-y-3">
        {/* 🔓 Unused Hints */}
        <AnimatePresence>
          {unusedHints.map((hint) => (
            <motion.div
              key={hint._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <HintBox hint={hint} onReveal={onReveal} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ✅ Used Hints */}
        {showUsed && (
          <AnimatePresence>
            {usedHints.map((hint) => (
              <motion.div
                key={hint._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <HintBox hint={hint} onReveal={onReveal} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default HintsList;