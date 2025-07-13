import Puzzle from '../models/Puzzle.js';
import Level from '../models/Level.js';
import mongoose from 'mongoose';


export const getAllPuzzles = async (req, res) => {
  try {
    const puzzles = await Puzzle.find()
      .populate('levelId', 'title levelNumber')
      .populate('scene', 'title description')
      .populate('hints', 'content hintLevel pointDeducted')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: puzzles,
      count: puzzles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve puzzles',
      error: error.message
    });
  }
};

export const getPuzzleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid puzzle ID format'
      });
    }

    const puzzle = await Puzzle.findById(id)
      .populate('levelId', 'title levelNumber difficulty')
      .populate('scene', 'title description backgroundImage')
      .populate('hints', 'content hintLevel pointDeducted');

    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      });
    }

    res.status(200).json({
      success: true,
      data: puzzle
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid puzzle ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve puzzle',
      error: error.message
    });
  }
};

export const getPuzzlesByLevelId = async (req, res) => {
  try {
    const { levelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(levelId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level ID format'
      });
    }

    // Verify level exists
    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }

    const puzzles = await Puzzle.find({ levelId })
      .populate('scene', 'title description')
      .populate('hints', 'content hintLevel pointDeducted')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: puzzles,
      count: puzzles.length
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid level ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve puzzles for level',
      error: error.message
    });
  }
};

export const createPuzzle = async (req, res) => {
  try {
    const {
      levelId,
      title,
      question,
      difficulty,
      solution,
      scene,
      hints
    } = req.body;

    // Validate required fields
    if (!levelId || !title || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'levelId, title, and difficulty are required'
      });
    }

    // Validate difficulty enum
    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty must be one of: Easy, Medium, Hard'
      });
    }

    // Verify level exists
    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }

    // Create puzzle
    const puzzle = await Puzzle.create({
      levelId,
      title,
      question,
      difficulty,
      solution,
      scene: scene || [],
      hints: hints || []
    });

    // Populate the created puzzle
    const populatedPuzzle = await Puzzle.findById(puzzle._id)
      .populate('levelId', 'title levelNumber')
      .populate('scene', 'title description')
      .populate('hints', 'content hintLevel');

    res.status(201).json({
      success: true,
      message: 'Puzzle created successfully',
      data: populatedPuzzle
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create puzzle',
      error: error.message
    });
  }
};

export const updatePuzzle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid puzzle ID format'
      });
    }

    // Check if puzzle exists
    const puzzle = await Puzzle.findById(id);
    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      });
    }

    // Validate difficulty if being updated
    if (updateData.difficulty && !['Easy', 'Medium', 'Hard'].includes(updateData.difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty must be one of: Easy, Medium, Hard'
      });
    }

    // If levelId is being updated, verify it exists
    if (updateData.levelId) {
      const level = await Level.findById(updateData.levelId);
      if (!level) {
        return res.status(404).json({
          success: false,
          message: 'Level not found'
        });
      }
    }

    // Update puzzle
    const updatedPuzzle = await Puzzle.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    )
    .populate('levelId', 'title levelNumber')
    .populate('scene', 'title description')
    .populate('hints', 'content hintLevel');

    res.status(200).json({
      success: true,
      message: 'Puzzle updated successfully',
      data: updatedPuzzle
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid puzzle ID format'
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update puzzle',
      error: error.message
    });
  }
};

export const deletePuzzle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid puzzle ID format'
      });
    }

    const puzzle = await Puzzle.findById(id);
    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      });
    }

    await Puzzle.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Puzzle deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid puzzle ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete puzzle',
      error: error.message
    });
  }
};
