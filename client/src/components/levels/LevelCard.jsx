import React, { useState, useEffect } from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';
import { FaPuzzlePiece, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PuzzleEditor from '../puzzles/PuzzleEditor'; 
import { getPuzzleById, createPuzzle, updatePuzzle } from '../../api/PuzzleApi';
import { updateLevel, deleteLevel } from '../../api/LevelApi'; 


const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
          aria-label="Close modal"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

const LevelCard = ({ level, onEdit, onDelete, onLevelUpdate }) => {
  const [managePuzzleOpen, setManagePuzzleOpen] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch puzzle data when component mounts or level changes
  useEffect(() => {
    if (level.puzzle) {
      fetchPuzzle(level.puzzle);
    } else {
      setPuzzle(null);
    }
  }, [level.puzzle]);

  // Fetch puzzle details using the API service
  const fetchPuzzle = async (puzzle) => {
    if (!puzzle) return ;
    
    try {
      setLoading(true);
      setError(null);
      const puzzleData = await getPuzzleById(puzzle._id);
      setPuzzle(puzzleData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching puzzle:', err);
      toast.error('Failed to load puzzle');
    } finally {
      setLoading(false);
    }
  };

  // Save edited puzzle using the API service
  const handleSavePuzzle = async (updatedPuzzle) => {
    try {
      setLoading(true);
      setError(null);
      
      const savedPuzzle = await updatePuzzle(updatedPuzzle._id, updatedPuzzle);
      setPuzzle(savedPuzzle);
      setEditingPuzzle(null);
      toast.success('Puzzle updated successfully');
      
      // Optionally trigger a refresh of the level data
      if (onLevelUpdate) {
        onLevelUpdate(level._id);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error saving puzzle:', err);
      toast.error('Failed to update puzzle');
    } finally {
      setLoading(false);
    }
  };

  // Delete level using the API service
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this level?')) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await deleteLevel(level._id);
      toast.success('Level deleted successfully');

      // Call the parent's delete handler
      if (onDelete) {
        onDelete(level);
      }
      window.location.reload();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting level:', err);
      toast.error('Failed to delete level');
    } finally {
      setLoading(false);
    }
  };

// Create new puzzle for this level using the API service
const handleCreatePuzzle = async () => {
  try {
    setLoading(true);
    setError(null);

    // Create a new puzzle object with the required structure
    const newPuzzleData = {
      levelId: level._id, // Associate with this level
      title: `Puzzle for ${level.title}`, // Default title
      question: "Enter your puzzle question here", // Default question
      difficulty: level.difficulty || "Easy", // Use level's difficulty or default
      solution: "Enter the solution here", // Default solution
      scene: [], // Empty array for scenes
      hints: [], // Empty array for hints
      points: 10 // Default points
    };

    console.log("Creating puzzle with data:", newPuzzleData); // Debug log

    const createdPuzzle = await createPuzzle(newPuzzleData);

    if (createdPuzzle?._id) {
      // Update the level to reference the new puzzle
      await updateLevel(level._id, {
        puzzle: createdPuzzle._id,
      });

      setPuzzle(createdPuzzle);
      setEditingPuzzle(createdPuzzle); // Open editor immediately
      toast.success('Puzzle created successfully');

      if (onLevelUpdate) {
        onLevelUpdate(level._id);
      }
    } else {
      throw new Error('Puzzle creation failed: No ID returned.');
    }
  } catch (err) {
    console.error('Error creating puzzle:', err);
    // Log server response details for debugging
    if (err.response?.data) {
      console.error('Server error details:', err.response.data);
      setError(err.response.data.message || err.message);
    } else {
      setError(err.message || 'An error occurred');
    }
    toast.error('Failed to create puzzle');
  } finally {
    setLoading(false);
  }
};
  

  // Remove puzzle from level
  const handleRemovePuzzle = async () => {
    if (!window.confirm('Are you sure you want to remove this puzzle from the level?')) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Update the level to remove the puzzle reference
      const updatedLevelData = {
        ...level,
        puzzle: '', // Remove puzzle reference
      };
      
      await updateLevel(level._id, updatedLevelData);
      
      setPuzzle(null);
      toast.success('Puzzle removed from level');
      
      // Optionally trigger a refresh of the level data
      if (onLevelUpdate) {
        onLevelUpdate(level._id);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error removing puzzle:', err);
      toast.error('Failed to remove puzzle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 hover:shadow-md border border-gray-200 space-y-2 transition ">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700 text-sm">
          Error: {error}
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-blue-700">
            Level {level.levelNumber}: {level.title}
          </h3>
          <p className="text-sm text-gray-500">{level.culturalElement}</p>
        </div>

        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            {
              Easy: 'bg-green-100 text-green-700',
              Medium: 'bg-yellow-100 text-yellow-700',
              Hard: 'bg-red-100 text-red-700',
            }[level.difficulty] || 'bg-gray-200 text-gray-700'
          }`}
        >
          {level.difficulty}
        </span>
      </div>

      <p className="text-gray-700 text-sm line-clamp-3">{level.description}</p>

      {level.reward && (
        <div className="text-sm text-green-600">
          <strong>Reward:</strong> {level.reward}
        </div>
      )}

      <div className="p-4 border rounded-md bg-white">
        <div className="flex justify-between items-start text-sm text-gray-600">
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-1">
              <FaClock className="text-blue-500" />
              {level.timeLimit} min
            </span>
            <button
              onClick={() => setManagePuzzleOpen(true)}
              className="flex items-center gap-1 text-blue-600 hover:underline"
              disabled={loading}
            >
              <FaPuzzlePiece className="text-blue-500" />
              {loading ? 'Loading...' : puzzle ? '1 puzzle' : 'No puzzle'}
            </button>
            {level.scene.title && (
              <span className="text-purple-600">
                Scene: {level.scene.title}
              </span>
            )}
          </div>

          <div className="flex gap-2 mt-1">
            {onEdit && (
              <button
                onClick={() => onEdit(level)}
                title="Edit"
                className="text-blue-600 hover:text-blue-800"
                disabled={loading}
              >
                <MdEdit size={18} />
              </button>
            )}
            <button
              onClick={handleDelete}
              title="Delete"
              className="text-red-600 hover:text-red-800"
              disabled={loading}
            >
              <MdDelete size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Manage Puzzle Modal */}
      <Modal open={managePuzzleOpen} onClose={() => setManagePuzzleOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Manage Puzzle</h2>
        
        {loading && <p className="text-gray-600">Loading puzzle...</p>}
        
        {!loading && !puzzle && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No puzzle assigned to this level.</p>
            <button
              onClick={handleCreatePuzzle}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              Create New Puzzle
            </button>
          </div>
        )}
        
        {!loading && puzzle && (
          <div className="space-y-4">
            <div className="border rounded p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold mb-2">{puzzle.title || puzzle.question || 'Untitled Puzzle'}</p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Question:</strong> {puzzle.question || 'No question set'}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Solution:</strong> {puzzle.solution || 'No solution set'}
                  </p>
                  <p className="text-sm text-gray-600 capitalize mb-1">
                    <strong>Difficulty:</strong> {puzzle.difficulty}
                  </p>
                  
                  
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => setEditingPuzzle(puzzle)}
                    aria-label="Edit puzzle"
                  >
                    <MdEdit size={18} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={handleRemovePuzzle}
                    aria-label="Remove puzzle"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setManagePuzzleOpen(false)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Puzzle Editor Modal */}
      <Modal open={!!editingPuzzle} onClose={() => setEditingPuzzle(null)}>
        {editingPuzzle && (
          <PuzzleEditor
            initialData={editingPuzzle}
            onSave={handleSavePuzzle}
            onCancel={() => setEditingPuzzle(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default LevelCard;