import React, { useEffect, useState } from 'react';
import HintBox from '../../components/hint/HintBox';
import { getAllHints } from '../../api/HintApi';
import { Box, Typography, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';

const HintPage = () => {
  const [hints, setHints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHints = async () => {
      try {
        setLoading(true);
        const fetchedHints = await getAllHints();
        setHints(fetchedHints);
      } catch (err) {
        setError('Failed to fetch hints');
        toast.error('Failed to load hints');
        console.error('Error fetching hints:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHints();
  }, []);

  const handleReveal = (hintId) => {
    setHints((prev) =>
      prev.map((hint) =>
        hint._id === hintId ? { ...hint, isUsed: true } : hint
      )
    );
    toast.info('Hint revealed – points deducted');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Hints
        </Typography>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Hints
      </Typography>
      {hints.length === 0 ? (
        <Typography>No hints available.</Typography>
      ) : (
        <Box display="grid" gap={2}>
          {hints.map((hint) => (
            <HintBox key={hint._id} hint={hint} onReveal={handleReveal} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default HintPage;