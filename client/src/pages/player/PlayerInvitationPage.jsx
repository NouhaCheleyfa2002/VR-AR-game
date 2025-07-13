import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Stack,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Fade,
} from '@mui/material';
import { toast } from 'react-toastify';
import InvitationCard from '../../components/invitations/InvitationCard';
import PartnershipList from '../../components/partnerships/PartnershipList';
import InvitationForm from '../../components/invitations/InvitationForm';

import {
  getAllInvitations,
  updateInvitation,
  deleteInvitation,
  createInvitation,
} from '../../api/Invitation';

const PlayerInvitationPage = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [formOpen, setFormOpen] = useState(false);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const data = await getAllInvitations();
      setInvitations(data);
    } catch (err) {
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  // Filtered tabs
  const filtered = {
    all: invitations,
    pending: invitations.filter((inv) => inv.invitationStatus === 'PENDING'),
    accepted: invitations.filter(
      (inv) => inv.invitationStatus === 'ACCEPTED' && inv.since
    ),
  };

  // Action handlers
  const handleAccept = async (id) => {
    try {
      const updated = await updateInvitation(id, {
        invitationStatus: 'ACCEPTED',
        since: new Date().toISOString(),
        isOnline: Math.random() < 0.5,
        lastInteraction: new Date().toISOString(),
      });
      toast.success('Invitation accepted');
      fetchInvitations();
    } catch (err) {
      toast.error('Failed to accept invitation');
    }
  };

  const handleDecline = async (id) => {
    try {
      await updateInvitation(id, { invitationStatus: 'DECLINED' });
      toast.info('Invitation declined');
      fetchInvitations();
    } catch (err) {
      toast.error('Failed to decline invitation');
    }
  };

  const handleCancel = async (id) => {
    try {
      await updateInvitation(id, { invitationStatus: 'CANCELLED' });
      toast.warn('Invitation cancelled');
      fetchInvitations();
    } catch (err) {
      toast.error('Failed to cancel invitation');
    }
  };

  const handleSend = async (invitationData) => {
    try {
      await createInvitation(invitationData);
      toast.success('Invitation sent');
      fetchInvitations();
      setFormOpen(false);
    } catch (err) {
      toast.error('Failed to send invitation');
    }
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Invitations & Partnerships</Typography>
        <Button variant="contained" onClick={() => setFormOpen(true)}>
          Send Invitation
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)}>
        <Tab label="All" />
        <Tab label="Pending" />
        <Tab label="Partnerships" />
      </Tabs>

      <Box mt={3}>
        {loading ? (
          <Box textAlign="center" mt={5}>
            <CircularProgress />
            <Typography mt={2}>Loading...</Typography>
          </Box>
        ) : tab === 0 ? (
          <Stack spacing={2}>
            {filtered.all.map((inv) => (
              <Fade in key={inv._id} timeout={300}>
                <Box>
                  <InvitationCard
                    invitation={inv}
                    onAccept={() => handleAccept(inv._id)}
                    onDecline={() => handleDecline(inv._id)}
                    onCancel={() => handleCancel(inv._id)}
                  />
                </Box>
              </Fade>
            ))}
          </Stack>
        ) : tab === 1 ? (
          <Stack spacing={2}>
            {filtered.pending.length > 0 ? (
              filtered.pending.map((inv) => (
                <Fade in key={inv._id} timeout={300}>
                  <Box>
                    <InvitationCard
                      invitation={inv}
                      onAccept={() => handleAccept(inv._id)}
                      onDecline={() => handleDecline(inv._id)}
                      onCancel={() => handleCancel(inv._id)}
                    />
                  </Box>
                </Fade>
              ))
            ) : (
              <Typography>No pending invitations.</Typography>
            )}
          </Stack>
        ) : (
          <PartnershipList
            partnerships={filtered.accepted}
            onInvite={(p) => {
              toast.success(`Follow-up invitation sent to ${p.partnerName}`);
            }}
            onContact={(p) => {
              toast.info(`Opening mail client for ${p.receiverEmail}`);
            }}
            onViewStatus={(p) => {
              console.log('Viewing status for', p.partnerName);
            }}
          />
        )}
      </Box>

      <InvitationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        partnerships={filtered.accepted}
        onSend={handleSend}
      />
    </Box>
  );
};

export default PlayerInvitationPage;
