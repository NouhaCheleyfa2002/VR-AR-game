import Feedback from '../models/Feedback.js';
import mongoose from 'mongoose';


export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('playerId', 'username email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching feedbacks',
      error: error.message
    });
  }
};

export const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID format'
      });
    }

    const feedback = await Feedback.findById(id)
      .populate('playerId', 'username email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching feedback',
      error: error.message
    });
  }
};

// GET /api/feedbacks/player/:playerId - Get feedbacks by player ID
export const getFeedbacksByPlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid player ID format'
      });
    }

    const feedbacks = await Feedback.find({ playerId })
      .populate('playerId', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    console.error('Error fetching player feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching player feedbacks',
      error: error.message
    });
  }
};

export const createFeedback = async (req, res) => {
  try {
    const { playerId, comment, rating } = req.body;

    // Validate required fields
    if (!playerId) {
      return res.status(400).json({
        success: false,
        message: 'Player ID is required'
      });
    }

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: 'Rating is required'
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid player ID format'
      });
    }

    // Validate rating range (model constraint)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const newFeedback = new Feedback({
      playerId,
      comment: comment || '',
      rating
    });

    const savedFeedback = await newFeedback.save();
    
    // Populate the saved feedback before returning
    const populatedFeedback = await Feedback.findById(savedFeedback._id)
      .populate('playerId', 'username email');

    res.status(201).json({
      success: true,
      message: 'Feedback created successfully',
      data: populatedFeedback
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating feedback',
      error: error.message
    });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, rating } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID format'
      });
    }

    // Validate rating if provided (model constraint)
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const updateData = {};
    if (comment !== undefined) updateData.comment = comment;
    if (rating !== undefined) updateData.rating = rating;

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('playerId', 'username email');

    if (!updatedFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: updatedFeedback
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating feedback',
      error: error.message
    });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID format'
      });
    }

    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully',
      data: deletedFeedback
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting feedback',
      error: error.message
    });
  }
};