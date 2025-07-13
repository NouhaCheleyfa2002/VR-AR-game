import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Rating,
  Paper,
} from '@mui/material';
import { toast } from 'react-toastify';
import { createFeedback, getFeedbacksByPlayer } from '../../api/FeedbackApi';

const FeedbackPage = ({ player }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState([]);
  const playerId = player?.id || player?._id || null;

  // Load previously submitted feedbacks by this player (optional)
  useEffect(() => {
    if (!playerId) return;

    const fetchPlayerFeedbacks = async () => {
      try {
        const data = await getFeedbacksByPlayer(playerId);
        setSubmittedFeedbacks(data);
      } catch (error) {
        toast.error('Failed to load your previous feedbacks');
        console.error(error);
      }
    };

    fetchPlayerFeedbacks();
  }, [playerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || comment.trim().length < 5) {
      toast.error('Please provide a rating and a valid comment (min 5 characters).');
      return;
    }

    const newFeedback = {
      playerId,
      playerName: player?.name || 'Anonymous',
      rating,
      comment,
      date: new Date().toISOString(),
    };

    try {
      const createdFeedback = await createFeedback(newFeedback);
      setSubmittedFeedbacks((prev) => [createdFeedback, ...prev]);
      toast.success('Feedback submitted!');

      // Reset form
      setRating(0);
      setComment('');
    } catch (error) {
      toast.error('Failed to submit feedback');
      console.error(error);
    }
  };

  return (
    <Box maxWidth="600px" mx="auto" p={4}>
      <Typography variant="h4" gutterBottom>
        Leave Your Feedback
      </Typography>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <div>
              <Typography variant="subtitle1">Your Rating:</Typography>
              <Rating
                name="rating"
                value={rating}
                onChange={(e, newValue) => setRating(newValue)}
              />
            </div>

            <TextField
              label="Your Comment"
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you enjoy or suggest?"
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!rating || comment.trim().length < 5}
            >
              Submit Feedback
            </Button>
          </Stack>
        </form>
      </Paper>

      {submittedFeedbacks.length > 0 && (
        <Box mt={5}>
          <Typography variant="h5" gutterBottom>
            Your Submitted Feedbacks
          </Typography>
          <Stack spacing={2}>
            {submittedFeedbacks.map((fb) => (
              <Paper key={fb._id || fb.feedbackId} sx={{ p: 2, borderLeft: '4px solid #1976d2' }}>
                <Typography variant="subtitle1">
                  {fb.playerName} —{' '}
                  <Rating value={fb.rating} readOnly size="small" />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(fb.date).toLocaleString()}
                </Typography>
                <Typography mt={1}>{fb.comment}</Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default FeedbackPage;
