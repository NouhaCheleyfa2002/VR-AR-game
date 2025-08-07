import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import DeleteIcon from '@mui/icons-material/Delete';

// Helper function to safely extract ID and title from populated or non-populated objects
const extractIdAndTitle = (obj) => {
  if (!obj) return { id: 'N/A', title: null };
  
  // If it's already a string (not populated)
  if (typeof obj === 'string') {
    return { id: obj, title: null };
  }
  
  // If it's a populated object with _id
  if (obj._id) {
    return { 
      id: obj._id.toString(), 
      title: obj.title || obj.name || null 
    };
  }
  
  // Fallback
  return { id: obj.toString(), title: null };
};

const QRCodeCard = ({ code, onDelete }) => {
  // Extract information from potentially populated fields
  const room = extractIdAndTitle(code.roomId);
  const game = extractIdAndTitle(code.gameId);
  const culturalElement = extractIdAndTitle(code.culturalElementId);
  
  // Handle expiration date - could be expirationDate or expirationTime
  const expirationDate = code.expirationDate || code.expirationTime;
  const isExpired = expirationDate ? new Date(expirationDate) < new Date() : false;
  
  // Handle scans
  const currentScans = code.scans || 0;
  const maxScans = code.maxScans || 0;
  const remainingScans = maxScans - currentScans;
  const scanLimitReached = remainingScans <= 0 && maxScans > 0;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        p: 2,
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <QrCode2Icon color="primary" />
            <Typography variant="h6" component="div">
              QR Code
            </Typography>
          </Box>
          {onDelete && (
            <IconButton 
              onClick={onDelete} 
              color="error" 
              size="small"
              sx={{ ml: 'auto' }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Display Game Information */}
        {game.id !== 'N/A' && (
          <Box mb={1}>
            <Typography variant="body2" color="text.secondary">
              <strong>Game:</strong>
            </Typography>
            <Typography variant="body1">
              {game.title || game.id}
            </Typography>
            {game.title && (
              <Typography variant="caption" color="text.secondary">
                ID: {game.id}
              </Typography>
            )}
          </Box>
        )}

        {/* Display Room Information */}
        {room.id !== 'N/A' && (
          <Box mb={1}>
            <Typography variant="body2" color="text.secondary">
              <strong>Room:</strong>
            </Typography>
            <Typography variant="body1">
              {room.title || room.id}
            </Typography>
            {room.title && (
              <Typography variant="caption" color="text.secondary">
                ID: {room.id}
              </Typography>
            )}
          </Box>
        )}

        {/* Display Cultural Element Information */}
        {culturalElement.id !== 'N/A' && (
          <Box mb={1}>
            <Typography variant="body2" color="text.secondary">
              <strong>Cultural Element:</strong>
            </Typography>
            <Typography variant="body1">
              {culturalElement.title || culturalElement.id}
            </Typography>
            {culturalElement.title && (
              <Typography variant="caption" color="text.secondary">
                ID: {culturalElement.id}
              </Typography>
            )}
          </Box>
        )}

        {/* Display QR Code Content */}
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            <strong>Content:</strong>
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'monospace', 
              bgcolor: 'grey.100', 
              p: 1, 
              borderRadius: 1,
              wordBreak: 'break-all'
            }}
          >
            {code.content || 'No content'}
          </Typography>
        </Box>

        {/* Status Chips */}
        <Box display="flex" gap={1} mt={2} flexWrap="wrap">
          {/* Expiration Status */}
          {expirationDate && (
            <Tooltip title="Expiration Time">
              <Chip
                icon={<AccessTimeIcon />}
                label={new Date(expirationDate).toLocaleString()}
                color={isExpired ? 'error' : 'default'}
                variant="outlined"
                size="small"
              />
            </Tooltip>
          )}

          {/* Scan Status */}
          {maxScans > 0 && (
            <Tooltip title="Scans Used">
              <Chip
                icon={<GroupIcon />}
                label={`${currentScans}/${maxScans} scans`}
                color={scanLimitReached ? 'warning' : 'success'}
                variant="outlined"
                size="small"
              />
            </Tooltip>
          )}

          {/* Overall Status */}
          <Chip
            icon={isExpired || scanLimitReached ? <ErrorIcon /> : <CheckCircleIcon />}
            label={
              isExpired
                ? 'Expired'
                : scanLimitReached
                ? 'Limit Reached'
                : 'Active'
            }
            color={isExpired || scanLimitReached ? 'error' : 'success'}
            variant="filled"
            size="small"
          />
        </Box>

        {/* Additional Info */}
        <Box mt={1}>
          <Typography variant="caption" color="text.secondary">
            Created: {code.createdAt ? new Date(code.createdAt).toLocaleString() : 'Unknown'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QRCodeCard;