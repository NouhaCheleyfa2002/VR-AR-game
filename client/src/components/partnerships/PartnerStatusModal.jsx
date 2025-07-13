import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stack,
  Chip,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const PartnerStatusModal = ({ open, onClose, partnership, invitations = [] }) => {
  if (!partnership) return null;

  const {
    partnerName,
    since,
    isOnline,
    lastInteraction,
    _id: partnershipId,  
  } = partnership;

  const filteredInvitations = invitations.filter(
    (inv) => inv.partnerId === partnershipId
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Partner Status: {partnerName}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <Typography variant="body1">Status:</Typography>
            <Chip
              label={isOnline ? 'Online' : 'Offline'}
              color={isOnline ? 'success' : 'default'}
            />
          </Stack>

          <Divider />

          <Typography variant="body2" color="text.secondary">
            Since Partnership: {since ? new Date(since).toLocaleDateString() : 'N/A'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last Interaction: {lastInteraction ? new Date(lastInteraction).toLocaleString() : 'N/A'}
          </Typography>

          <Divider />

          <Typography variant="subtitle1">Recent Invitations</Typography>
          {filteredInvitations.length > 0 ? (
            <List dense>
              {filteredInvitations.map((inv) => (
                <ListItem key={inv._id}>
                  <ListItemText
                    primary={`To: ${inv.receiverEmail}`}
                    secondary={`Status: ${inv.invitationStatus} • Sent: ${new Date(
                      inv.sentAt
                    ).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No invitations found.
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartnerStatusModal;
