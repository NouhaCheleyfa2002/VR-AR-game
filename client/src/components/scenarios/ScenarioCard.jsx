import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const ScenarioCard = ({ scenario, onEdit, onDelete }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        position: 'relative',
        borderRadius: 3,
        transition: '0.3s',
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        {/* Title */}
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {scenario.title}
        </Typography>

        {/* Historical Theme */}
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <HistoryEduIcon fontSize="small" color="primary" />
          <Typography variant="body2" color="text.secondary">
            {scenario.historicalTheme}
          </Typography>
        </Box>

        {/* Target Audience */}
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <GroupIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {scenario.targetAudience}
          </Typography>
        </Box>

        {/* Active status */}
        <Chip
          size="small"
          label={scenario.isActive ? 'Active' : 'Inactive'}
          color={scenario.isActive ? 'success' : 'default'}
          icon={scenario.isActive ? <CheckCircleIcon /> : <CancelIcon />}
          variant="outlined"
        />
      </CardContent>

      {/* Actions on hover */}
      {(onEdit || onDelete) && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 1,
            opacity: 0,
            transition: '0.3s',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          {onEdit && (
            <Chip
              size="small"
              label="Edit"
              onClick={onEdit}
              clickable
              sx={{ bgcolor: 'primary.light', color: 'white' }}
            />
          )}
          {onDelete && (
            <Chip
              size="small"
              label="Delete"
              onClick={onDelete}
              clickable
              sx={{ bgcolor: 'error.light', color: 'white' }}
            />
          )}
        </Box>
      )}
    </Card>
  );
};

export default ScenarioCard;
