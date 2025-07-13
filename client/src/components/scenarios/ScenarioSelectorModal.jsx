import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import ScenarioCard from './ScenarioCard';

const ScenarioSelectorModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  selectedScenarios = [], 
  allScenarios = [] 
}) => {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected(selectedScenarios.map(s => s._id));
  }, [selectedScenarios]);

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const selectedScenarioObjects = allScenarios.filter(s => selected.includes(s._id));
    onConfirm(selectedScenarioObjects);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Scenarios</DialogTitle>
      <DialogContent dividers>
        {allScenarios.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 italic">No scenarios available</p>
          </div>
        ) : (
          <Grid container spacing={2}>
            {allScenarios.map(scenario => (
              <Grid item xs={12} md={6} key={scenario._id}>
                <div
                  onClick={() => toggleSelect(scenario._id)}
                  className={`border rounded-lg p-2 cursor-pointer transition hover:shadow-md ${
                    selected.includes(scenario._id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <FormControlLabel
                    control={<Checkbox checked={selected.includes(scenario._id)} />}
                    label={scenario.title}
                    onClick={(e) => e.stopPropagation()} // Prevent double toggle
                  />
                  <ScenarioCard scenario={scenario} />
                  {scenario.levels && scenario.levels.length > 0 && (
                    <div className="ml-6 mt-2 text-sm text-gray-700">
                      <strong>Levels:</strong>
                      <ul className="list-disc list-inside">
                        {scenario.levels.map(level => (
                          <li key={level.levelId || level._id}>{level.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleConfirm}
          disabled={selected.length === 0}
        >
          Confirm ({selected.length} selected)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScenarioSelectorModal;