import React from 'react';
import {
  Grid,
  Typography,
  Box,
  Fade,
  Paper,
} from '@mui/material';
import PartnershipCard from './PartnershipCard';

const PartnershipList = ({ partnerships = [], onInvite, onContact, onViewStatus }) => {
  const isEmpty = partnerships.length === 0;

  return (
    <Box mt={2}>
      {isEmpty ? (
        <Fade in={true}>
          <Paper
            elevation={2}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              backgroundColor: '#f9f9f9',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No partnerships found.
            </Typography>
            <Typography variant="body2" mt={1}>
              You can add a new partnership or wait to receive one.
            </Typography>
          </Paper>
        </Fade>
      ) : (
        <Grid container spacing={2}>
          {partnerships.map((partnership) => (
            <Fade in={true} timeout={300} key={partnership._id}>
              <Grid item xs={12} sm={6} md={4}>
                <PartnershipCard
                  partnership={partnership}
                  onInvite={onInvite}
                  onContact={onContact}
                  onViewStatus={onViewStatus}
                />
              </Grid>
            </Fade>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PartnershipList;
