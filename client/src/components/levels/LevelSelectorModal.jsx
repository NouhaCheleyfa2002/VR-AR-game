import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import LevelCard from './LevelCard';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

const LevelSelectorModal = ({ open, onClose, onConfirm, selectedLevels, allLevels }) => {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected(selectedLevels.map(lvl => lvl._id || lvl.levelId)); 
  }, [selectedLevels]);

  const toggleSelect = (levelId) => {
    setSelected(prev =>
      prev.includes(levelId) ? prev.filter(id => id !== levelId) : [...prev, levelId]
    );
  };

  const handleConfirm = () => {
    const updatedLevels = allLevels.filter(level => selected.includes(level._id));
    onConfirm(updatedLevels);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <div className="p-4 max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Select Levels</h2>
        <Box
          sx={{
            maxHeight: '60vh',
            overflowY: 'auto',
            px: 1, 
          }}
        >
          <Grid container spacing={2}>
            {allLevels.map(level => {
              const isSelected = selected.includes(level._id);
              return (
                <Grid
                  item
                  xs={12}
                  md={6}
                  key={level._id}
                  onClick={() => toggleSelect(level._id)}
                  sx={{
                    border: 2,
                    borderColor: isSelected ? 'primary.main' : 'transparent',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'border-color 0.3s',
                    '&:hover': {
                      borderColor: isSelected ? 'primary.main' : 'grey.400',
                    },
                    p: 2,
                    userSelect: 'none',
                  }}
                >
                  <LevelCard level={level} />
                </Grid>
              );
            })}
          </Grid>
        </Box>
        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirm}>Confirm</Button>
        </div>
      </div>
    </Dialog>
  );
};

export default LevelSelectorModal;