import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Rating,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { toast } from 'react-toastify';

import { createFeedback, getFeedbacksByPlayer } from '../../api/FeedbackApi';
import { AuthContext } from '../../context/AuthContext'; // Adjust the path as needed

const FeedbackPage = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playerLoading, setPlayerLoading] = useState(false);
  
  // Use AuthContext instead of manual token retrieval
  const { user, token } = useContext(AuthContext);

  // Extract player ID and email from the context user
  const playerId = user?.playerId?._id || user?._id || null;
  const playerEmail = user?.playerId?.email || user?.email || 'Anonymous';
  
  // Load previously submitted feedbacks by this player
  useEffect(() => {
    if (!playerId || !token) return;

    const fetchPlayerFeedbacks = async () => {
      setLoading(true);
      try {
        const response = await getFeedbacksByPlayer(playerId, token);
        
        // Handle the API response structure
        const feedbackData = response || [];
        
        // Transform the data to match what the UI expects
        const transformedFeedbacks = feedbackData.map(fb => ({
          ...fb,
          playerName: fb.playerId?.email || playerEmail,
          feedbackId: fb._id
        }));
        
        setSubmittedFeedbacks(transformedFeedbacks);
      } catch (error) {
        toast.error('Failed to load your previous feedbacks');
        console.error('Error fetching feedbacks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerFeedbacks();
  }, [playerId, playerEmail, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!playerId) {
      toast.error('Player information is missing');
      return;
    }

    if (!rating || comment.trim().length < 5) {
      toast.error('Please provide a rating and a valid comment (min 5 characters).');
      return;
    }

    const newFeedback = {
      playerId: playerId, 
      playerEmail: playerEmail,
      rating,
      comment,
      date: new Date().toISOString(),
    };

    setLoading(true);
    try {
      // Pass token if available (some APIs might allow public feedback creation)
      const createdFeedback = await createFeedback(newFeedback, token);
      
      // Transform the created feedback to match UI expectations
      const transformedFeedback = {
        ...createdFeedback,
        playerName: createdFeedback.playerId?.email || playerEmail,
        feedbackId: createdFeedback._id
      };
      
      setSubmittedFeedbacks((prev) => [transformedFeedback, ...prev]);
      toast.success('Feedback submitted successfully!');

      // Reset form
      setRating(0);
      setComment('');
    } catch (error) {
      toast.error('Failed to submit feedback');
      console.error('Error creating feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show error state if player data is not available
  if (!user || !playerId) {
    return (
      <Box maxWidth="600px" mx="auto" p={4}>
        <Typography variant="h4" gutterBottom>
          Leave Your Feedback
        </Typography>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <Typography>
            {!token ? 
              'You need to be logged in to leave feedback. Please log in and try again.' :
              'Player information is not available. Please make sure you are logged in.'
            }
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={() => {
              if (!token) {
                // Redirect to login page
                window.location.href = '/login';
              } else {
                window.location.reload();
              }
            }}
          >
            {!token ? 'Go to Login' : 'Retry'}
          </Button>
        </Alert>
        
        {/* Debug info - remove this in production */}
        <Paper sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="subtitle2">Debug Information:</Typography>
          <Typography variant="body2">User object: {JSON.stringify(user, null, 2)}</Typography>
          <Typography variant="body2">Token available: {!!token}</Typography>
          <Typography variant="body2">Player ID: {playerId}</Typography>
          <Typography variant="body2">Player Email: {playerEmail}</Typography>
        </Paper>
      </Box>
    );
  }

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
                size="large"
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
              helperText={`${comment.length}/5 characters minimum`}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!rating || comment.trim().length < 5 || loading}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </Stack>
        </form>
      </Paper>

      {submittedFeedbacks.length > 0 && (
        <Box mt={5}>
          <Typography variant="h5" gutterBottom>
            Your Submitted Feedbacks
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
              <Typography ml={2}>Loading feedbacks...</Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {submittedFeedbacks.map((fb) => (
                <Paper key={fb._id || fb.feedbackId} sx={{ p: 2, borderLeft: '4px solid #1976d2' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1">
                      {fb.playerName || fb.playerId?.email || 'Anonymous'}
                    </Typography>
                    <Rating value={fb.rating} readOnly size="small" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(fb.createdAt || fb.date).toLocaleString()}
                  </Typography>
                  <Typography mt={1}>{fb.comment}</Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FeedbackPage;