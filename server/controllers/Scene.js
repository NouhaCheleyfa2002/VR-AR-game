import Scene from '../models/Scene.js';
import Level from '../models/Level.js';

// @desc    Get all scenes
// @route   GET /api/scenes
// @access  Public or Protected depending on use
export const getAllScenes = async (req, res) => {
  try {
    const scenes = await Scene.find().populate('levelId', 'title levelNumber');
    res.status(200).json(scenes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch scenes', error: error.message });
  }
};

// @desc    Get scene by ID
// @route   GET /api/scenes/:id
// @access  Public or Protected depending on use
export const getSceneById = async (req, res) => {
  try {
    const scene = await Scene.findById(req.params.id).populate('levelId', 'title');
    if (!scene) {
      return res.status(404).json({ message: 'Scene not found' });
    }
    res.status(200).json(scene);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch scene', error: error.message });
  }
};

// @desc    Get scenes by level ID
// @route   GET /api/scenes/level/:levelId
// @access  Public or Protected depending on use
export const getScenesByLevelId = async (req, res) => {
  try {
    const scenes = await Scene.find({ levelId: req.params.levelId });
    res.status(200).json(scenes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch scenes for level', error: error.message });
  }
};

// @desc    Create a new scene
// @route   POST /api/scenes
// @access  Protected (Admin or Game Creator)
export const createScene = async (req, res) => {
  try {
    const { levelId, sceneTitle, description, objects, interactions } = req.body;

    // Optional: Verify that the level exists
    const levelExists = await Level.findById(levelId);
    if (!levelExists) {
      return res.status(404).json({ message: 'Level not found' });
    }

    const newScene = new Scene({
      levelId,
      sceneTitle,
      description,
      objects,
      interactions,
    });

    const savedScene = await newScene.save();
    res.status(201).json(savedScene);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create scene', error: error.message });
  }
};

// @desc    Update an existing scene
// @route   PUT /api/scenes/:id
// @access  Protected (Admin or Game Creator)
export const updateScene = async (req, res) => {
  try {
    const updatedScene = await Scene.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedScene) {
      return res.status(404).json({ message: 'Scene not found' });
    }

    res.status(200).json(updatedScene);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update scene', error: error.message });
  }
};

// @desc    Delete a scene
// @route   DELETE /api/scenes/:id
// @access  Protected (Admin or Game Creator)
export const deleteScene = async (req, res) => {
  try {
    const deletedScene = await Scene.findByIdAndDelete(req.params.id);
    if (!deletedScene) {
      return res.status(404).json({ message: 'Scene not found' });
    }
    res.status(200).json({ message: 'Scene deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete scene', error: error.message });
  }
};
