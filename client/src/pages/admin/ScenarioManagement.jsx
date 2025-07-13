import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import ScenarioCard from '../../components/scenarios/ScenarioCard';
import ScenarioForm from '../../components/scenarios/ScenarioForm';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { 
  getAllScenarios, 
  createScenario, 
  updateScenario, 
  deleteScenario 
} from '../../api/ScenarioApi';

const ManageScenarioPage = () => {
  const [scenarios, setScenarios] = useState([]);
  const [filteredScenarios, setFilteredScenarios] = useState([]);
  const [editingScenario, setEditingScenario] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [themeFilter, setThemeFilter] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 4;

  // Dynamic filter options based on actual data - using 'theme' instead of 'historicalTheme'
  const availableThemes = useMemo(() => {
    if (!Array.isArray(scenarios)) return [];
    return [...new Set(scenarios.map(s => s.theme).filter(Boolean))];
  }, [scenarios]);

  const availableAudiences = useMemo(() => {
    if (!Array.isArray(scenarios)) return [];
    return [...new Set(scenarios.map(s => s.targetAudience).filter(Boolean))];
  }, [scenarios]);

  // Fetch scenarios from API
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllScenarios();
        // Ensure we're setting an array
        setScenarios(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError('Failed to fetch scenarios');
        toast.error('Failed to fetch scenarios');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  // Filter scenarios based on search and filters - using 'theme' instead of 'historicalTheme'
  useEffect(() => {
    if (!Array.isArray(scenarios)) {
      setFilteredScenarios([]);
      return;
    }

    let filtered = scenarios.filter(s =>
      (s.title?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (s.theme?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    );

    if (themeFilter) {
      filtered = filtered.filter(s => s.theme === themeFilter);
    }
    
    if (audienceFilter) {
      filtered = filtered.filter(s => s.targetAudience === audienceFilter);
    }

    setFilteredScenarios(filtered);
    setPage(1);
  }, [searchTerm, themeFilter, audienceFilter, scenarios]);

  const paginatedScenarios = filteredScenarios.slice((page - 1) * pageSize, page * pageSize);

  const handleSave = async (data) => {
    try {
      if (editingScenario) {
        await updateScenario(editingScenario._id, data);
        toast.success('Scenario updated');
      } else {
        await createScenario(data);
        toast.success('Scenario added');
      }

      // Refresh scenarios list
      const response = await getAllScenarios();
      setScenarios(Array.isArray(response.data) ? response.data : []);
      
      setIsModalOpen(false);
      setEditingScenario(null);
    } catch (err) {
      toast.error('Failed to save scenario');
      console.error(err);
    }
  };

  const handleDelete = async (scenario) => {
    if (window.confirm(`Are you sure you want to delete "${scenario.title}"?`)) {
      try {
        await deleteScenario(scenario._id);
        setScenarios(prev => Array.isArray(prev) ? prev.filter(s => s._id !== scenario._id) : []);
        toast.success('Scenario deleted');
      } catch (err) {
        toast.error('Failed to delete scenario');
        console.error(err);
      }
    }
  };

  const handleAddNew = () => {
    setEditingScenario(null);
    setIsModalOpen(true);
  };

  const handleEdit = (scenario) => {
    setEditingScenario(scenario);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingScenario(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </Box>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Scenarios</h1>
        <Button variant="contained" onClick={handleAddNew}>
          + Add Scenario
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <TextField
          label="Search by title or theme"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <FormControl fullWidth>
          <InputLabel>Theme</InputLabel>
          <Select
            value={themeFilter}
            label="Theme"
            onChange={e => setThemeFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {availableThemes.map(theme => (
              <MenuItem key={theme} value={theme}>{theme}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Audience</InputLabel>
          <Select
            value={audienceFilter}
            label="Audience"
            onChange={e => setAudienceFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {availableAudiences.map(audience => (
              <MenuItem key={audience} value={audience}>{audience}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {paginatedScenarios.length} of {filteredScenarios.length} scenarios
      </div>

      {/* Scenarios Grid */}
      {paginatedScenarios.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 italic mb-4">
            {scenarios.length === 0 ? 'No scenarios created yet.' : 'No scenarios match your filters.'}
          </p>
          {scenarios.length === 0 && (
            <Button variant="contained" onClick={handleAddNew}>
              Create Your First Scenario
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {paginatedScenarios.map(scenario => (
            <div key={scenario._id} className="relative group">
              <ScenarioCard scenario={scenario} />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-2">
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => handleEdit(scenario)}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="error" 
                  onClick={() => handleDelete(scenario)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredScenarios.length > pageSize && (
        <div className="flex justify-center mt-6">
          <Pagination
            count={Math.ceil(filteredScenarios.length / pageSize)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingScenario ? 'Edit Scenario' : 'Add New Scenario'}
        </DialogTitle>
        <DialogContent dividers>
          <ScenarioForm
            initialData={editingScenario}
            onSave={handleSave}
            onCancel={handleCloseModal}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManageScenarioPage;