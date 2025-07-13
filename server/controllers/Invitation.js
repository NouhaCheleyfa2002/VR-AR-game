import Invitation from '../models/Invitation.js';
import mongoose from 'mongoose';

export const getAllInvitations = async (req, res) => {
  try {
    const filter = {};

    // Optional: filter by discriminator type (e.g., 'Partnership')
    if (req.query.type) {
      filter.__t = req.query.type; // Mongoose stores the discriminator name in __t
    }

    const invitations = await Invitation.find(filter)
      .populate('sender', 'username email')
      .populate('receiver', 'username email')
      .sort({ sentAt: -1 });

    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching invitations',
      error: error.message
    });
  }
};

// GET /api/invitations/:id - Get invitation by ID
export const getInvitationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation ID format'
      });
    }

    const invitation = await Invitation.findById(id)
      .populate('sender', 'username email')
      .populate('receiver', 'username email');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: invitation
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching invitation',
      error: error.message
    });
  }
};


export const getInvitationsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate status enum
    const validStatuses = ['pending', 'accepted', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, accepted, rejected, cancelled'
      });
    }

    const invitations = await Invitation.find({ invitationStatus: status.toLowerCase() })
      .populate('sender', 'username email')
      .populate('receiver', 'username email')
      .sort({ sentAt: -1 });

    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations
    });
  } catch (error) {
    console.error('Error fetching invitations by status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching invitations by status',
      error: error.message
    });
  }
};


export const getInvitationsBySender = async (req, res) => {
  try {
    const { senderId } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sender ID format'
      });
    }

    const invitations = await Invitation.find({ sender: senderId })
      .populate('sender', 'username email')
      .populate('receiver', 'username email')
      .sort({ sentAt: -1 });

    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations
    });
  } catch (error) {
    console.error('Error fetching invitations by sender:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching invitations by sender',
      error: error.message
    });
  }
};


export const createInvitation = async (req, res) => {
  try {
    const { sender, receiver, receiverEmail, invitationStatus } = req.body;

    // Validate required fields
    if (!sender) {
      return res.status(400).json({
        success: false,
        message: 'Sender ID is required'
      });
    }

    if (!receiverEmail) {
      return res.status(400).json({
        success: false,
        message: 'Receiver email is required'
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(sender)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sender ID format'
      });
    }

    if (receiver && !mongoose.Types.ObjectId.isValid(receiver)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiver ID format'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(receiverEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate invitation status if provided
    if (invitationStatus && !['pending', 'accepted', 'rejected', 'cancelled'].includes(invitationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation status. Must be one of: pending, accepted, rejected, cancelled'
      });
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      sender,
      receiverEmail,
      invitationStatus: 'pending'
    });

    if (existingInvitation) {
      return res.status(409).json({
        success: false,
        message: 'Pending invitation already exists for this email'
      });
    }

    const newInvitation = new Invitation({
      sender,
      receiver: receiver || null,
      receiverEmail,
      invitationStatus: invitationStatus || 'pending'
    });

    const savedInvitation = await newInvitation.save();
    
    // Populate the saved invitation before returning
    const populatedInvitation = await Invitation.findById(savedInvitation._id)
      .populate('sender', 'username email')
      .populate('receiver', 'username email');

    res.status(201).json({
      success: true,
      message: 'Invitation created successfully',
      data: populatedInvitation
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating invitation',
      error: error.message
    });
  }
};


export const updateInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const { receiver, receiverEmail, invitationStatus } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation ID format'
      });
    }

    // Validate receiver ObjectId if provided
    if (receiver && !mongoose.Types.ObjectId.isValid(receiver)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiver ID format'
      });
    }

    // Validate email format if provided
    if (receiverEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(receiverEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }
    }

    // Validate invitation status if provided
    if (invitationStatus && !['pending', 'accepted', 'rejected', 'cancelled'].includes(invitationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation status. Must be one of: pending, accepted, rejected, cancelled'
      });
    }

    const updateData = {};
    if (receiver !== undefined) updateData.receiver = receiver;
    if (receiverEmail !== undefined) updateData.receiverEmail = receiverEmail;
    if (invitationStatus !== undefined) updateData.invitationStatus = invitationStatus;

    const updatedInvitation = await Invitation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('sender', 'username email')
     .populate('receiver', 'username email');

    if (!updatedInvitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Invitation updated successfully',
      data: updatedInvitation
    });
  } catch (error) {
    console.error('Error updating invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating invitation',
      error: error.message
    });
  }
};


export const deleteInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation ID format'
      });
    }

    const deletedInvitation = await Invitation.findByIdAndDelete(id);

    if (!deletedInvitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Invitation deleted successfully',
      data: deletedInvitation
    });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting invitation',
      error: error.message
    });
  }
};