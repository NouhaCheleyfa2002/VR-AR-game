import EscapeGame from '../models/EscapeGame.js';
import mongoose from 'mongoose';


export const getAllEscapeGames = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 6, // Match frontend itemsPerPage
      theme,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (theme) filter.theme = theme;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    if (sortBy === 'title') {
      sort.title = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'duration') {
      sort.estimatedDuration = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute query with population
    const escapeGames = await EscapeGame.find(filter)
      .populate('scenarios', 'title description difficulty')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await EscapeGame.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: escapeGames,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching escape games',
      error: error.message
    });
  }
};

export const getEscapeGameById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid escape game ID format'
      });
    }

    const escapeGame = await EscapeGame.findById(id)
      .populate('scenarios', 'title description difficulty timeLimit');

    if (!escapeGame) {
      return res.status(404).json({
        success: false,
        message: 'Escape game not found'
      });
    }

    res.status(200).json({
      success: true,
      data: escapeGame
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching escape game',
      error: error.message
    });
  }
};


export const createEscapeGame = async (req, res) => {
  try {
    const {
      title,
      description,
      theme,
      estimatedDuration,
      isActive,
      maxPlayers,
      culturalContext,
      scenarios
    } = req.body;

    // Validation
    if (!title || !theme || !estimatedDuration) {
      return res.status(400).json({
        success: false,
        message: 'Title, theme, and estimated duration are required'
      });
    }

    if (estimatedDuration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Estimated duration must be greater than 0'
      });
    }

    // Validate scenario IDs if provided
    if (scenarios && scenarios.length > 0) {
      const invalidIds = scenarios.filter(id => !mongoose.Types.ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid scenario ID(s) provided'
        });
      }
    }

    // Check if escape game with same title already exists
    const existingGame = await EscapeGame.findOne({ title });
    if (existingGame) {
      return res.status(409).json({
        success: false,
        message: 'Escape game with this title already exists'
      });
    }

    const escapeGame = new EscapeGame({
      title,
      description,
      theme,
      estimatedDuration,
      isActive: isActive || false,
      culturalContext,
      maxPlayers,
      scenarios: scenarios || []
    });

    const savedGame = await escapeGame.save();
    
    // Populate scenarios for response
    const populatedGame = await EscapeGame.findById(savedGame._id)
      .populate('scenarios', 'title description difficulty');

    res.status(201).json({
      success: true,
      message: 'Escape game created successfully',
      data: populatedGame
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating escape game',
      error: error.message
    });
  }
};

export const updateEscapeGame = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      theme,
      estimatedDuration,
      isActive,
      maxPlayers,
      culturalContext,
      scenarios
    } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid escape game ID format'
      });
    }

    // Check if escape game exists
    const existingGame = await EscapeGame.findById(id);
    if (!existingGame) {
      return res.status(404).json({
        success: false,
        message: 'Escape game not found'
      });
    }

    // Validation for updated fields
    if (estimatedDuration !== undefined && estimatedDuration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Estimated duration must be greater than 0'
      });
    }

    // Validate scenario IDs if provided
    if (scenarios && scenarios.length > 0) {
      const invalidIds = scenarios.filter(id => !mongoose.Types.ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid scenario ID(s) provided'
        });
      }
    }

    // Check for title uniqueness if title is being updated
    if (title && title !== existingGame.title) {
      const gameWithSameTitle = await EscapeGame.findOne({ title });
      if (gameWithSameTitle) {
        return res.status(409).json({
          success: false,
          message: 'Escape game with this title already exists'
        });
      }
    }

    // Build update object
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (theme !== undefined) updateData.theme = theme;
    if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (culturalContext !== undefined) updateData.culturalContext = culturalContext;
    if (maxPlayers !== undefined) updateData.maxPlayers = maxPlayers;
    if (scenarios !== undefined) updateData.scenarios = scenarios;

    const updatedGame = await EscapeGame.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('scenarios', 'title description difficulty');

    res.status(200).json({
      success: true,
      message: 'Escape game updated successfully',
      data: updatedGame
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating escape game',
      error: error.message
    });
  }
};

export const deleteEscapeGame = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid escape game ID format'
      });
    }

    const escapeGame = await EscapeGame.findById(id);
    if (!escapeGame) {
      return res.status(404).json({
        success: false,
        message: 'Escape game not found'
      });
    }

    //We dont wanna delete an active game
    if (escapeGame.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an active escape game. Please deactivate it first.'
      });
    }

    await EscapeGame.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Escape game deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting escape game',
      error: error.message
    });
  }
};



export const toggleEscapeGameActive = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid escape game ID format'
      });
    }

    const escapeGame = await EscapeGame.findById(id);
    if (!escapeGame) {
      return res.status(404).json({
        success: false,
        message: 'Escape game not found'
      });
    }

    escapeGame.isActive = !escapeGame.isActive;
    await escapeGame.save();

    res.status(200).json({
      success: true,
      message: `Escape game ${escapeGame.isActive ? 'activated' : 'deactivated'} successfully`,
      data: escapeGame
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while toggling escape game status',
      error: error.message
    });
  }
};