import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Stack,
  Box,
} from '@mui/material';
import {
  Send,
  Cancel,
  Done,
  Clear,
} from '@mui/icons-material';

const InvitationCard = ({ invitation, onAccept, onDecline, onCancel }) => {
  const { _id, sentAt, invitationStatus, partnerName, since } = invitation;

  const statusColor = {
    PENDING: 'warning',
    ACCEPTED: 'success',
    DECLINED: 'error',
    CANCELLED: 'default',
  };

  const isPartner = invitationStatus === 'ACCEPTED' && since;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6">Partner: {partnerName}</Typography>
        <Typography variant="body2" color="text.secondary">
          Sent At: {new Date(sentAt).toLocaleString()}
        </Typography>
        <Box mt={1}>
          <Chip
            label={invitationStatus}
            color={statusColor[invitationStatus] || 'default'}
          />
          {isPartner && (
            <Chip
              label="Partner"
              color="success"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>

        {invitationStatus === 'PENDING' && (
          <Stack direction="row" spacing={1} mt={2}>
            <Button
              color="success"
              variant="contained"
              startIcon={<Done />}
              onClick={() => onAccept(_id)}
            >
              Accept
            </Button>
            <Button
              color="error"
              variant="outlined"
              startIcon={<Clear />}
              onClick={() => onDecline(_id)}
            >
              Decline
            </Button>
            <Button
              color="inherit"
              variant="text"
              startIcon={<Cancel />}
              onClick={() => onCancel(_id)}
            >
              Cancel
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default InvitationCard;
