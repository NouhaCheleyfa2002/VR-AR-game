import React from 'react';
import { Paper, Grid, Typography } from '@mui/material';

const SummaryStats = ({ invitations }) => {
  const countByStatus = (status) =>
    invitations.filter((i) => i.invitationStatus === status).length;

  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <Typography variant="subtitle2">Total</Typography>
          <Typography>{invitations.length}</Typography>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Typography variant="subtitle2">Pending</Typography>
          <Typography>{countByStatus('PENDING')}</Typography>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Typography variant="subtitle2">Accepted</Typography>
          <Typography>{countByStatus('ACCEPTED')}</Typography>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Typography variant="subtitle2">Declined</Typography>
          <Typography>{countByStatus('DECLINED')}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SummaryStats;
