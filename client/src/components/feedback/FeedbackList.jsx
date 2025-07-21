import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, Button, CircularProgress } from '@mui/material';
import FeedbackCard from './FeedbackCard';
import FeedbackForm from './FeedbackForm';
import { toast } from 'react-toastify';

// Import your API functions
import { getAllFeedbacks, deleteFeedback, updateFeedback } from '../../api/FeedbackApi';

const FeedbackList = ({ isAdmin = false }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load feedbacks from API
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await getAllFeedbacks();
        
        // Handle the API response structure
        const feedbackData = response.data || response;
        
        // Transform the data to ensure consistent structure
        const transformedFeedbacks = feedbackData.map(fb => ({
          ...fb,
          playerName: fb.playerId?.email || 'Anonymous',
          playerEmail: fb.playerId?.email || 'Anonymous',
          date: fb.createdAt || fb.date
        }));
        
        setFeedbacks(transformedFeedbacks);
      } catch (error) {
        toast.error('Failed to load feedbacks');
        console.error('Error fetching feedbacks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await deleteFeedback(id);
      setFeedbacks((prev) => prev.filter((fb) => fb._id !== id));
      toast.success('Feedback deleted successfully');
    } catch (error) {
      toast.error('Failed to delete feedback');
      console.error('Error deleting feedback:', error);
    }
  };

  const handleEdit = (fb) => {
    setEditing(fb);
    setFormOpen(true);
  };

  const handleSubmit = async (updatedFeedback) => {
    try {
      const exists = feedbacks.find((fb) => fb._id === updatedFeedback._id);
      
      if (exists) {
        // Update existing feedback
        const updated = await updateFeedback(updatedFeedback._id, updatedFeedback);
        
        setFeedbacks((prev) =>
          prev.map((fb) =>
            fb._id === updatedFeedback._id ? {
              ...updated,
              playerName: updated.playerId?.email || updatedFeedback.playerName,
              playerEmail: updated.playerId?.email || updatedFeedback.playerEmail,
              date: updated.createdAt || updated.date
            } : fb
          )
        );
        toast.success('Feedback updated successfully');
      } else {
        // Create new feedback (this should typically be handled by FeedbackPage)
        const newFeedback = {
          ...updatedFeedback,
          _id: Date.now().toString(), // Temporary ID until API response
          date: new Date().toISOString()
        };
        
        setFeedbacks((prev) => [newFeedback, ...prev]);
        toast.success('Feedback added successfully');
      }
      
      setEditing(null);
    } catch (error) {
      toast.error('Failed to save feedback');
      console.error('Error saving feedback:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Feedback Management</Typography>
        {isAdmin && (
          <Button variant="contained" onClick={() => setFormOpen(true)}>
            Add Feedback
          </Button>
        )}
      </Stack>

      {feedbacks.length === 0 ? (
        <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
          No feedback available yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {feedbacks.map((fb) => (
            <FeedbackCard
              key={fb._id}
              feedback={fb}
              isAdmin={isAdmin}
              onDelete={() => handleDelete(fb._id)}
              onEdit={() => handleEdit(fb)}
            />
          ))}
        </Stack>
      )}

      <FeedbackForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initialData={editing}
      />
    </Box>
  );
};

export default FeedbackList;