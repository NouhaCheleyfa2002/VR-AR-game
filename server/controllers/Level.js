import Level from '../models/Level.js';
import Scenario from '../models/Scenario.js';


export const getAllLevels = async (req, res) => {
  try {
    
    const levels = await Level.find()
      .populate('scenarioId', 'title description')
      .populate('puzzle', 'title type')
      .populate('scene', 'title description')
      .sort({ levelNumber: 1 }); // Basic sorting by level number

    res.status(200).json({
      success: true,
      data: levels,
      count: levels.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve levels',
      error: error.message
    });
  }
};

export const getLevelById = async (req, res) => {
  try {
    const { id } = req.params;

    const level = await Level.findById(id)
      .populate('scenarioId', 'title description category')
      .populate('puzzle', 'title type difficulty question')
      .populate('scene', 'title description backgroundImage');

    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }

    res.status(200).json({
      success: true,
      data: level
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
      message: 'Failed to retrieve level',
      error: error.message
    });
  }
};

export const getLevelsByScenarioId = async (req, res) => {
  try {
    const { scenarioId } = req.params;

    // Verify scenario exists
    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: 'Scenario not found'
      });
    }

    const levels = await Level.find({ scenarioId })
      .populate('puzzle', 'title type difficulty')
      .populate('scene', 'title description')
      .sort({ levelNumber: 1 });

    res.status(200).json({
      success: true,
      data: levels,
      scenario: {
        id: scenario._id,
        title: scenario.title,
        description: scenario.description
      },
      count: levels.length
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
      message: 'Failed to retrieve levels for scenario',
      error: error.message
    });
  }
};

export const createLevel = async (req, res) => {
  try {
    const {
      scenarioId,
      levelNumber,
      title,
      description,
      difficulty,
      timeLimit,
      puzzle,
      scene,
      reward,
      culturalElement
    } = req.body;

    // Validate required fields
    if (!scenarioId || !levelNumber || !title || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: scenarioId, levelNumber, title, difficulty'
      });
    }

    // Verify scenario exists
    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: 'Scenario not found'
      });
    }

    // Check if level number already exists for this scenario
    const existingLevelNumber = await Level.findOne({ 
      scenarioId, 
      levelNumber 
    });
    if (existingLevelNumber) {
      return res.status(400).json({
        success: false,
        message: 'Level number already exists for this scenario'
      });
    }

    // Create new level
    const level = await Level.create({
      scenarioId,
      levelNumber,
      title,
      description,
      difficulty,
      timeLimit: timeLimit || 0,
      puzzle,
      scene,
      reward,
      culturalElement
    });

    // Populate the created level
    const populatedLevel = await Level.findById(level._id)
      .populate('scenarioId', 'title description')
      .populate('puzzle', 'title type')
      .populate('scene', 'title description');

    res.status(201).json({
      success: true,
      message: 'Level created successfully',
      data: populatedLevel
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
      message: 'Failed to create level',
      error: error.message
    });
  }
};

// @desc    Update level
// @route   PUT /api/levels/:id
// @access  Private/Admin
export const updateLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if level exists
    const level = await Level.findById(id);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }

    // If scenarioId is being updated, verify it exists
    if (updateData.scenarioId) {
      const scenario = await Scenario.findById(updateData.scenarioId);
      if (!scenario) {
        return res.status(404).json({
          success: false,
          message: 'Scenario not found'
        });
      }
    }

    // If level number is being updated, check for duplicates within scenario
    if (updateData.levelNumber && updateData.levelNumber !== level.levelNumber) {
      const scenarioIdToCheck = updateData.scenarioId || level.scenarioId;
      const existingLevelNumber = await Level.findOne({
        scenarioId: scenarioIdToCheck,
        levelNumber: updateData.levelNumber,
        _id: { $ne: id }
      });
      if (existingLevelNumber) {
        return res.status(400).json({
          success: false,
          message: 'Level number already exists for this scenario'
        });
      }
    }

    // Update level
    const updatedLevel = await Level.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    )
    .populate('scenarioId', 'title description')
    .populate('puzzle', 'title type')
    .populate('scene', 'title description');

    res.status(200).json({
      success: true,
      message: 'Level updated successfully',
      data: updatedLevel
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid level ID format'
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
      message: 'Failed to update level',
      error: error.message
    });
  }
};

// @desc    Delete level
// @route   DELETE /api/levels/:id
// @access  Private/Admin
export const deleteLevel = async (req, res) => {
  try {
    const { id } = req.params;

    const level = await Level.findById(id);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }

    await Level.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Level deleted successfully',
      data: {
        id: level._id,
        title: level.title
      }
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
      message: 'Failed to delete level',
      error: error.message
    });
  }
};