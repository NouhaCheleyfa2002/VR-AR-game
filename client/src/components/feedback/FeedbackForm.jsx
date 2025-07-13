import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Stack,
} from '@mui/material';

const FeedbackForm = ({ open, onClose, onSubmit, initialData = null }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating);
      setComment(initialData.comment);
    } else {
      setRating(0);
      setComment('');
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    const feedback = {
      ...initialData,
      rating,
      comment,
      date: new Date().toISOString(),
    };
    onSubmit(feedback);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Feedback' : 'Submit Feedback'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Rating
            value={rating}
            onChange={(e, newValue) => setRating(newValue)}
            precision={0.5}
          />
          <TextField
            label="Comment"
            multiline
            minRows={3}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {initialData ? 'Update' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackForm;
