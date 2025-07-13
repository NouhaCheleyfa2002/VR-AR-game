import React, { useState } from 'react';
import {
  TextField,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';
import { toast } from 'react-toastify';

const InvitationForm = ({ open, onClose, partnerships, onSend }) => {
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [email, setEmail] = useState('');

  const handleSend = () => {
    if (!selectedPartnerId || !email) {
      toast.error('All fields are required');
      return;
    }

    const invitationData = {
      partnerId: selectedPartnerId, // Should correspond to partnership._id
      receiverEmail: email,
      sentAt: new Date().toISOString(),
      invitationStatus: 'PENDING',
    };

    onSend(invitationData);
    onClose();
    setSelectedPartnerId('');
    setEmail('');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Send Invitation</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            select
            label="Select Partnership"
            value={selectedPartnerId}
            onChange={(e) => setSelectedPartnerId(e.target.value)}
            fullWidth
          >
            {partnerships.map((partner) => (
              <MenuItem key={partner._id} value={partner._id}>
                {partner.partnerName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Receiver Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            type="email"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSend} variant="contained">Send</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvitationForm;
