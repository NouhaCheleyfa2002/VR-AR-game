import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
} from '@mui/material';

const PuzzleCard = ({ puzzle, onEdit }) => {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h6" component="h3" gutterBottom>
          {puzzle.title}
        </Typography>
        <Typography variant="h6" component="h3" gutterBottom>
          {puzzle.question}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          puzzle ID: {puzzle._id}
        </Typography>

        <Chip
          label={puzzle.difficulty}
          variant="outlined"
          sx={{ textTransform: 'capitalize', fontWeight: 'medium' }}
          color={
            puzzle.difficulty === 'Easy'
              ? 'success'
              : puzzle.difficulty === 'Medium'
              ? 'warning'
              : 'error'
          }
        />

        {showSolution && (
          <Box mt={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Solution:
            </Typography>
            <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>
              {puzzle.solution}
            </Typography>
          </Box>
        )}
      </CardContent>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          size="small"
          variant="text"
          onClick={() => setShowSolution((prev) => !prev)}
        >
          {showSolution ? 'Hide Solution' : 'Show Solution'}
        </Button>

        <Button size="small" variant="contained" onClick={() => onEdit(puzzle)}>
          Edit
        </Button>
      </Box>
    </Card>
  );
};

export default PuzzleCard;
