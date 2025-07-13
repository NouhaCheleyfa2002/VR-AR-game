import React, { useState } from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import FeedbackCard from './FeedbackCard';
import FeedbackForm from './FeedbackForm';
import {feedbackData} from '../../assets/dummyData';

const FeedbackList = ({ isAdmin = false }) => {
  const [feedbacks, setFeedbacks] = useState(feedbackData);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleDelete = (id) => {
    setFeedbacks((prev) => prev.filter((fb) => fb.feedbackId !== id));
  };

  const handleEdit = (fb) => {
    setEditing(fb);
    setFormOpen(true);
  };

  const handleSubmit = (updatedFeedback) => {
    setFeedbacks((prev) => {
      const exists = prev.find((fb) => fb.feedbackId === updatedFeedback.feedbackId);
      if (exists) {
        return prev.map((fb) =>
          fb.feedbackId === updatedFeedback.feedbackId ? updatedFeedback : fb
        );
      }
      return [...prev, { ...updatedFeedback, feedbackId: Date.now() }];
    });
    setEditing(null);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Feedback</Typography>
        <Button variant="contained" onClick={() => setFormOpen(true)}>
          Add Feedback
        </Button>
      </Stack>

      <Stack spacing={2}>
        {feedbacks.map((fb) => (
          <FeedbackCard
            key={fb.feedbackId}
            feedback={fb}
            isAdmin={isAdmin}
            onDelete={() => handleDelete(fb.feedbackId)}
            onEdit={() => handleEdit(fb)}
          />
        ))}
      </Stack>

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
