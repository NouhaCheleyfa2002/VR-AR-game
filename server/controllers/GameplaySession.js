// controllers/gameplaySession.controller.js
import GameplaySession from '../models/GameplaySession.js';
import mongoose from 'mongoose';


export const getAllSessions = async (req, res) => {
  try {
    const sessions = await GameplaySession.find({})
      .populate('playerId', 'username email')
      .populate('levelId', 'title difficulty')
      .populate('assignedLevel', 'title difficulty')
      .populate('gameId', 'title theme')
      .populate('roomId', 'roomName')
      .populate('hintsUsed', 'title description')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sessions',
      error: error.message
    });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID format'
      });
    }

    const session = await GameplaySession.findById(id)
      .populate('playerId', 'username email')
      .populate('levelId', 'title difficulty timeLimit')
      .populate('assignedLevel', 'title difficulty timeLimit')
      .populate('gameId', 'title theme description')
      .populate('roomId', 'roomName maxPlayers')
      .populate('hintsUsed', 'title description');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user can access this session
    if (req.user.role !== 'admin' && session.playerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own sessions.'
      });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching session',
      error: error.message
    });
  }
};


export const getSessionsByPlayerId = async (req, res) => {
  try {
    const { playerId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid player ID format'
      });
    }

    // Check if user can access these sessions
    if (req.user.role !== 'admin' && playerId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own sessions.'
      });
    }

    const sessions = await GameplaySession.find({ playerId })
      .populate('levelId', 'title difficulty')
      .populate('assignedLevel', 'title difficulty')
      .populate('gameId', 'title theme')
      .populate('roomId', 'roomName')
      .populate('hintsUsed', 'title description')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching player sessions',
      error: error.message
    });
  }
};

export const getSessionsByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room ID format'
      });
    }

    let query = { roomId };
    
    // If not admin, only show their own sessions
    if (req.user.role !== 'admin') {
      query.playerId = req.user._id;
    }

    const sessions = await GameplaySession.find(query)
      .populate('playerId', 'username email')
      .populate('levelId', 'title difficulty')
      .populate('assignedLevel', 'title difficulty')
      .populate('gameId', 'title theme')
      .populate('roomId', 'roomName maxPlayers')
      .populate('hintsUsed', 'title description')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching room sessions',
      error: error.message
    });
  }
};

export const createSession = async (req, res) => {
  try {
    const {
      levelId,
      assignedLevel,
      gameId,
      roomId,
      preferredDifficulty,
      culturalKnowledge,
      adaptationScore
    } = req.body;

    // Validation
    if (!levelId) {
      return res.status(400).json({
        success: false,
        message: 'Level ID is required'
      });
    }

    // Validate required ObjectIds
    if (!mongoose.Types.ObjectId.isValid(levelId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level ID format'
      });
    }

    // Validate optional ObjectIds
    if (assignedLevel && !mongoose.Types.ObjectId.isValid(assignedLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assigned level ID format'
      });
    }

    if (gameId && !mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid game ID format'
      });
    }

    if (roomId && !mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room ID format'
      });
    }

    // Check if user already has an active session for this level
    const existingActiveSession = await GameplaySession.findOne({
      playerId: req.user._id,
      levelId,
      gameState: 'active'
    });

    if (existingActiveSession) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active session for this level'
      });
    }

    const session = new GameplaySession({
      playerId: req.user._id,
      levelId,
      assignedLevel,
      gameId,
      roomId,
      preferredDifficulty,
      culturalKnowledge: culturalKnowledge || 0,
      adaptationScore: adaptationScore || 0
    });

    const savedSession = await session.save();
    
    // Populate for response
    const populatedSession = await GameplaySession.findById(savedSession._id)
      .populate('playerId', 'username email')
      .populate('levelId', 'title difficulty timeLimit')
      .populate('assignedLevel', 'title difficulty timeLimit')
      .populate('gameId', 'title theme description')
      .populate('roomId', 'roomName maxPlayers');

    res.status(201).json({
      success: true,
      message: 'Gameplay session created successfully',
      data: populatedSession
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating session',
      error: error.message
    });
  }
};

export const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      endTime,
      timeSpent,
      totalScore,
      hintsUsed,
      hintUsageRate,
      culturalKnowledge,
      adaptationScore,
      errorRate,
      preferredDifficulty,
      avgSolveTime,
      completionRate,
      gameState
    } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID format'
      });
    }

    // Check if session exists
    const existingSession = await GameplaySession.findById(id);
    if (!existingSession) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user can update this session
    if (req.user.role !== 'admin' && existingSession.playerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own sessions.'
      });
    }

    // Validate hint IDs if provided
    if (hintsUsed && hintsUsed.length > 0) {
      const invalidHints = hintsUsed.filter(hintId => !mongoose.Types.ObjectId.isValid(hintId));
      if (invalidHints.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid hint ID(s) provided'
        });
      }
    }

    // Build update object
    const updateData = {};
    if (endTime !== undefined) {
      updateData.endTime = endTime;
      // Calculate time spent if not provided
      if (timeSpent === undefined && endTime) {
        const startTime = existingSession.startTime;
        updateData.timeSpent = Math.floor((new Date(endTime) - new Date(startTime)) / (1000 * 60)); // in minutes
      }
    }
    if (timeSpent !== undefined) updateData.timeSpent = timeSpent;
    if (totalScore !== undefined) updateData.totalScore = totalScore;
    if (hintsUsed !== undefined) updateData.hintsUsed = hintsUsed;
    if (hintUsageRate !== undefined) updateData.hintUsageRate = hintUsageRate;
    if (culturalKnowledge !== undefined) updateData.culturalKnowledge = culturalKnowledge;
    if (adaptationScore !== undefined) updateData.adaptationScore = adaptationScore;
    if (errorRate !== undefined) updateData.errorRate = errorRate;
    if (preferredDifficulty !== undefined) updateData.preferredDifficulty = preferredDifficulty;
    if (avgSolveTime !== undefined) updateData.avgSolveTime = avgSolveTime;
    if (completionRate !== undefined) updateData.completionRate = completionRate;
    if (gameState !== undefined) updateData.gameState = gameState;

    const updatedSession = await GameplaySession.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('playerId', 'username email')
      .populate('levelId', 'title difficulty timeLimit')
      .populate('assignedLevel', 'title difficulty timeLimit')
      .populate('gameId', 'title theme description')
      .populate('roomId', 'roomName maxPlayers')
      .populate('hintsUsed', 'title description');

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: updatedSession
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating session',
      error: error.message
    });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID format'
      });
    }

    const session = await GameplaySession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await GameplaySession.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting session',
      error: error.message
    });
  }
};