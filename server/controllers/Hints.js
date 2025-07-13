import Hint from '../models/Hints.js';
import mongoose from 'mongoose';


export const getAllHints = async (req, res) => {
  try {
    const hints = await Hint.find().populate('puzzleId', 'title');
    res.status(200).json({ success: true, data: hints });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching hints', error: error.message });
  }
};

export const getHintById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid hint ID format' });
  }

  try {
    const hint = await Hint.findById(id).populate('puzzleId', 'title');
    if (!hint) {
      return res.status(404).json({ success: false, message: 'Hint not found' });
    }
    res.status(200).json({ success: true, data: hint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching hint', error: error.message });
  }
};

export const getHintsByPuzzleId = async (req, res) => {
  const { puzzleId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(puzzleId)) {
    return res.status(400).json({ success: false, message: 'Invalid puzzle ID format' });
  }

  try {
    const hints = await Hint.find({ puzzleId }).sort({ hintLevel: 1 });
    res.status(200).json({ success: true, data: hints });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching hints for puzzle', error: error.message });
  }
};

export const createHint = async (req, res) => {
  const { puzzleId, content, hintLevel, pointDeducted } = req.body;

  if (!puzzleId || !content || !hintLevel) {
    return res.status(400).json({ success: false, message: 'puzzleId, content, and hintLevel are required' });
  }

  try {
    const newHint = new Hint({
      puzzleId,
      content,
      hintLevel,
      pointDeducted: pointDeducted || 0
    });

    const savedHint = await newHint.save();
    res.status(201).json({ success: true, message: 'Hint created successfully', data: savedHint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while creating hint', error: error.message });
  }
};

export const updateHint = async (req, res) => {
  const { id } = req.params;
  const { content, hintLevel, pointDeducted, isUsed } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid hint ID format' });
  }

  try {
    const hint = await Hint.findById(id);
    if (!hint) {
      return res.status(404).json({ success: false, message: 'Hint not found' });
    }

    if (content !== undefined) hint.content = content;
    if (hintLevel !== undefined) hint.hintLevel = hintLevel;
    if (pointDeducted !== undefined) hint.pointDeducted = pointDeducted;
    if (isUsed !== undefined) hint.isUsed = isUsed;

    const updatedHint = await hint.save();
    res.status(200).json({ success: true, message: 'Hint updated successfully', data: updatedHint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while updating hint', error: error.message });
  }
};

export const deleteHint = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid hint ID format' });
  }

  try {
    const hint = await Hint.findById(id);
    if (!hint) {
      return res.status(404).json({ success: false, message: 'Hint not found' });
    }

    await Hint.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Hint deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while deleting hint', error: error.message });
  }
};