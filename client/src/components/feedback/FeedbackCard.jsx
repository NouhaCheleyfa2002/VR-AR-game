import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Rating,
  Stack,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { format } from 'date-fns';

const FeedbackCard = ({ feedback, isAdmin = false, onEdit, onDelete }) => {
  const { rating, comment, date, playerId } = feedback;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">
            {playerId.email || 'Anonymous'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(date), 'PPpp')}
          </Typography>
        </Stack>

        <Box mt={1}>
          <Rating value={rating} precision={0.5} readOnly />
        </Box>

        <Typography variant="body2" mt={1} color="text.secondary">
          {comment}
        </Typography>

        {isAdmin && (
          <Stack direction="row" spacing={1} mt={2} justifyContent="flex-end">
            <Tooltip title="Edit">
              <IconButton onClick={() => onEdit?.(feedback)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton color="error" onClick={() => onDelete?.(feedback)}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackCard;
