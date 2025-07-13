import Scenario from '../models/Scenario.js';
import EscapeGame from '../models/EscapeGame.js';


export const getAllScenarios = async (req, res) => {
  try {
    const scenarios = await Scenario.find()
      .populate('gameId', 'title description category')
      .populate('levels', 'title levelNumber difficulty')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: scenarios,
      count: scenarios.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve scenarios',
      error: error.message
    });
  }
};

export const getScenarioById = async (req, res) => {
  try {
    const { id } = req.params;

    const scenario = await Scenario.findById(id)
      .populate('gameId', 'title description category')
      .populate({
        path: 'levels',
        select: 'title levelNumber difficulty timeLimit',
        options: { sort: { levelNumber: 1 } }
      });

    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: 'Scenario not found'
      });
    }

    res.status(200).json({
      success: true,
      data: scenario
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid scenario ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve scenario',
      error: error.message
    });
  }
};

export const getScenariosByGameId = async (req, res) => {
  try {
    const { gameId } = req.params;

    // Verify game exists
    const game = await EscapeGame.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    const scenarios = await Scenario.find({ gameId })
      .populate('levels', 'title levelNumber difficulty')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: scenarios,
      game: {
        id: game._id,
        title: game.title,
        description: game.description
      },
      count: scenarios.length
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid game ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve scenarios for game',
      error: error.message
    });
  }
};

export const createScenario = async (req, res) => {
  try {
    const {
      gameId,
      title,
      historicalTheme,
      targetAudience,
      isActive
    } = req.body;

    // Validate required fields
    if (!gameId || !title || !historicalTheme) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: gameId, title, historicalTheme'
      });
    }

    // Verify game exists
    const game = await EscapeGame.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Create new scenario
    const scenario = await Scenario.create({
      gameId,
      title,
      historicalTheme,
      targetAudience,
      isActive: isActive !== undefined ? isActive : true
    });

    // Populate the created scenario
    const populatedScenario = await Scenario.findById(scenario._id)
      .populate('gameId', 'title description category');

    res.status(201).json({
      success: true,
      message: 'Scenario created successfully',
      data: populatedScenario
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
      message: 'Failed to create scenario',
      error: error.message
    });
  }
};

export const updateScenario = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if scenario exists
    const scenario = await Scenario.findById(id);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: 'Scenario not found'
      });
    }

    // If gameId is being updated, verify it exists
    if (updateData.gameId) {
      const game = await EscapeGame.findById(updateData.gameId);
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        });
      }
    }

    // Update scenario
    const updatedScenario = await Scenario.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    )
    .populate('gameId', 'title description category')
    .populate('levels', 'title levelNumber difficulty');

    res.status(200).json({
      success: true,
      message: 'Scenario updated successfully',
      data: updatedScenario
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid scenario ID format'
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
      message: 'Failed to update scenario',
      error: error.message
    });
  }
};

export const deleteScenario = async (req, res) => {
  try {
    const { id } = req.params;

    const scenario = await Scenario.findById(id);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: 'Scenario not found'
      });
    }

    // Check if scenario has associated levels
    if (scenario.levels && scenario.levels.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete scenario with associated levels. Please delete levels first.'
      });
    }

    await Scenario.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Scenario deleted successfully',
      data: {
        id: scenario._id,
        title: scenario.title
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid scenario ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete scenario',
      error: error.message
    });
  }
};