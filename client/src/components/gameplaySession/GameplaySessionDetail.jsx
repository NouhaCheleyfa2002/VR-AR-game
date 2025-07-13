import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  Grid,
} from '@mui/material';
import HintsList from '../hint/HintsList';

const GameplaySessionDetail = ({ session }) => {
  if (!session) {
    return (
      <Box p={2}>
        <Typography variant="h6" color="text.secondary">
          No session data available.
        </Typography>
      </Box>
    );
  }

  const {
    _id,
    playerId,
    gameId,
    roomId,
    startTime,
    endTime,
    totalScore,
    hintsUsed,
    completionRate,
    errorRate,
    avgSolveTime,
    preferredDifficulty,
    hints = [],
    createdAt,
    updatedAt,
  } = session;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toString();
  };

  return (
    <Box>
      {/* Session Metadata */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Session Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Session ID</Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {_id}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Player ID</Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {formatValue(playerId)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Game ID</Typography>
              <Typography variant="body1">{formatValue(gameId)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Room ID</Typography>
              <Typography variant="body1">{formatValue(roomId)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Start Time</Typography>
              <Typography variant="body1">{formatDate(startTime)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">End Time</Typography>
              <Typography variant="body1">{formatDate(endTime)}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Performance Metrics
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Stack spacing={2}>
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Chip 
                    label={`Total Score: ${formatValue(totalScore)}`} 
                    color="primary" 
                    variant="outlined"
                    sx={{ width: '100%', justifyContent: 'flex-start' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Chip 
                    label={`Hints Used: ${formatValue(hintsUsed)}`} 
                    color="warning" 
                    variant="outlined"
                    sx={{ width: '100%', justifyContent: 'flex-start' }}
                  />
                </Grid>
              </Grid>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                <Typography variant="body1">{formatValue(completionRate)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Error Rate</Typography>
                <Typography variant="body1">{formatValue(errorRate)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Average Solve Time</Typography>
                <Typography variant="body1">{formatValue(avgSolveTime)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Preferred Difficulty</Typography>
                <Typography variant="body1">{formatValue(preferredDifficulty)}</Typography>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {/* Hints Section */}
      {Array.isArray(hints) && hints.length > 0 && (
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Hints Used During Session
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <HintsList hints={hints} />
          </CardContent>
        </Card>
      )}

      {/* Additional metadata if available */}
      {(createdAt || updatedAt) && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              System Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {createdAt && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Created At</Typography>
                  <Typography variant="body1">{formatDate(createdAt)}</Typography>
                </Grid>
              )}
              {updatedAt && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Updated At</Typography>
                  <Typography variant="body1">{formatDate(updatedAt)}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default GameplaySessionDetail;