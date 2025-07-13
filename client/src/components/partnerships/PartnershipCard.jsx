import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PersonAdd,
  Email,
  Visibility,
  CheckCircle,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const PartnershipCard = ({ partnership, onInvite, onContact, onViewStatus }) => {
  const {
    since,
    isOnline,
    lastInteraction,
    partnerName,
    invitationStatus,
    receiverEmail,
    sentAt,
  } = partnership;

  const [statusOpen, setStatusOpen] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const sentDate = sentAt ? new Date(sentAt).toLocaleString() : 'N/A';
  const sinceDate = since ? new Date(since).toLocaleDateString() : 'N/A';
  const lastInteractionDate = lastInteraction ? new Date(lastInteraction).toLocaleString() : 'N/A';

  const handleInvite = () => {
    onInvite(partnership);
    setInviteSent(true);
  };

  const handleContact = () => {
    onContact(partnership);
    // Open mail client in same tab for better compatibility
    window.location.href = `mailto:${receiverEmail}?subject=Follow-up on VR partnership`;

    // Optional fallback toast if no email client:
    // Note: Cannot detect reliably if email client opened
    setTimeout(() => {
      toast.warn('If your email client did not open, please contact manually at: ' + receiverEmail);
    }, 2000);
  };

  const handleViewStatus = () => {
    onViewStatus(partnership);
    setStatusOpen(true);
  };

  return (
    <>
      <Card sx={{ borderRadius: 3, p: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6">{partnerName}</Typography>
          <Typography variant="body2" color="text.secondary">
            Status: {invitationStatus}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sent to: {receiverEmail}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sent At: {sentDate}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Since: {sinceDate}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last Seen: {lastInteractionDate}
          </Typography>

          <Chip
            label={isOnline ? 'Online' : 'Offline'}
            color={isOnline ? 'success' : 'default'}
            size="small"
            sx={{ mt: 1 }}
          />

          <Stack direction="row" spacing={1} mt={2}>
            <Button
              aria-label={inviteSent ? "Invite Sent" : "Send Invitation"}
              variant="contained"
              startIcon={inviteSent ? <CheckCircle /> : <PersonAdd />}
              onClick={handleInvite}
              disabled={inviteSent}
              color={inviteSent ? 'success' : 'primary'}
            >
              {inviteSent ? 'Invite Sent' : 'Invite'}
            </Button>
            <Button
              aria-label="Contact partner"
              variant="outlined"
              startIcon={<Email />}
              onClick={handleContact}
            >
              Contact
            </Button>
            <Button
              aria-label="View partnership status"
              variant="text"
              startIcon={<Visibility />}
              onClick={handleViewStatus}
            >
              Status
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Partnership Details</DialogTitle>
        <DialogContent dividers>
          <Typography><strong>Partner:</strong> {partnerName}</Typography>
          <Typography><strong>Email:</strong> {receiverEmail}</Typography>
          <Typography><strong>Status:</strong> {invitationStatus}</Typography>
          <Typography><strong>Sent At:</strong> {sentDate}</Typography>
          <Typography><strong>Since:</strong> {sinceDate}</Typography>
          <Typography><strong>Last Interaction:</strong> {lastInteractionDate}</Typography>
          <Typography><strong>Connection:</strong> {isOnline ? 'Currently Online' : 'Currently Offline'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PartnershipCard;
