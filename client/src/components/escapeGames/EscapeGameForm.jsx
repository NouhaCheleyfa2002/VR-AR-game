import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ScenarioSelectorModal from '../scenarios/ScenarioSelectorModal';
import Button from '@mui/material/Button';
import { getAllScenarios } from '../../api/ScenarioApi';
import { getAllEscapeGames } from '../../api/EscapeGameApi';
import ScenarioCard from '../../components/scenarios/ScenarioCard';

const EscapeGameForm = ({ onSubmit, initialData }) => { // Added initialData prop
  const [allScenarios, setAllScenarios] = useState([]);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  // Removed unused isModalOpen state

  const [gameData, setGameData] = useState({
    title: '',
    description: '',
    theme: '',
    maxPlayers: 4,
    estimatedDuration: 30,
    isActive: true,
    culturalContext: '',
    scenarios: [],
  });

  const [availableThemes, setAvailableThemes] = useState([]);
  const [availableContexts, setAvailableContexts] = useState([]);

  // Populate form if editing
  useEffect(() => {
    if (initialData) {
      setGameData({
        title: initialData.title || '',
        description: initialData.description || '',
        theme: initialData.theme || '',
        maxPlayers: initialData.maxPlayers || 4,
        estimatedDuration: initialData.estimatedDuration || 30,
        isActive: initialData.isActive ?? true,
        culturalContext: initialData.culturalContext || '',
        scenarios: Array.isArray(initialData.scenarios) 
        ? initialData.scenarios.map(s => typeof s === 'string' ? s : s._id)
        : [],
      });
    }
  }, [initialData]); // Added initialData as dependency

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGameData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!gameData.title || !gameData.description || !gameData.theme || !gameData.culturalContext || !gameData.maxPlayers || !gameData.scenarios.length) {
      toast.error('Please fill all required fields.');
      return;
    }

    toast.success('Escape Game Created!');
    console.log('Escape Game Data:', gameData);

    if (onSubmit) onSubmit(gameData);
  };

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const res = await getAllScenarios();
        setAllScenarios(res);
      } catch (error) {
        toast.error('Failed to fetch scenarios');
        console.error(error);
      }
    };
  
    fetchScenarios();
  }, []);
  
  useEffect(() => {
    const fetchGameAttributes = async () => {
      try {
        const response = await getAllEscapeGames();
        
        const games = response || '';
        
        if (Array.isArray(games)) {
          const themes = [...new Set(games.map(g => g.theme).filter(Boolean))];
          const contexts = [...new Set(games.map(g => g.culturalContext).filter(Boolean))];
          
          setAvailableThemes(themes);
          setAvailableContexts(contexts);
        } else {
          console.error('Expected array but got:', typeof games, games);
        }
      } catch (err) {
        toast.error('Failed to fetch themes and contexts');
        console.error(err);
      }
    };
    
    fetchGameAttributes();
  }, []);

  const handleScenarioConfirm = (selectedScenarios) => {
    setGameData(prev => ({
      ...prev,
      scenarios: selectedScenarios.map(s => s._id),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-xl shadow-xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-700">Create Escape Game</h2>

      {/* Title */}
      <div>
        <label className="block font-semibold mb-1">Title</label>
        <input
          name="title"
          value={gameData.title}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block font-semibold mb-1">Description</label>
        <textarea
          name="description"
          value={gameData.description}
          onChange={handleChange}
          rows={4}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Theme */}
      <div>
        <label className="block font-semibold mb-1">Theme</label>
        <select
          name="theme"
          value={gameData.theme}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Select a theme</option>
          {availableThemes.map(theme => (
            <option key={theme} value={theme}>{theme}</option>
          ))}
        </select>
      </div>

      {/* Max Players */}
      <div>
        <label className="block font-semibold mb-1">Max Players</label>
        <input
          type="number"
          name="maxPlayers"
          min={1}
          value={gameData.maxPlayers}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Estimated Duration */}
      <div>
        <label className="block font-semibold mb-1">Estimated Duration (min)</label>
        <input
          type="range"
          name="estimatedDuration"
          min={15}
          max={120}
          step={5}
          value={gameData.estimatedDuration}
          onChange={handleChange}
          className="w-full"
        />
        <p className="text-sm text-gray-600">Duration: {gameData.estimatedDuration} minutes</p>
      </div>

      {/* isActive */}
      <div className="flex items-center gap-3">
        <label className="font-semibold">Is Active?</label>
        <input
          type="checkbox"
          name="isActive"
          checked={gameData.isActive}
          onChange={handleChange}
          className="w-5 h-5"
        />
      </div>

      {/* Cultural Context */}
      <div>
        <label className="block font-semibold mb-1">Cultural Context</label>
        <select
          name="culturalContext"
          value={gameData.culturalContext}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Select context</option>
          {availableContexts.map(ctx => (
            <option key={ctx} value={ctx}>{ctx}</option>
          ))}
        </select>
      </div>

      {/* scenarios  */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Linked Scenarios</h3>
        <div className="grid gap-2">
          {gameData.scenarios.length === 0 ? (
            <p className="text-gray-500 italic">No scenarios assigned yet.</p>
          ) : (
            gameData.scenarios
              .map(id => allScenarios.find(s => s._id === id))
              .filter(Boolean) // Filter out undefined scenarios
              .map(scenario => (
                <ScenarioCard key={scenario._id} scenario={scenario} />
              ))
          )}
        </div>
        <Button className="mt-4" onClick={() => setIsScenarioModalOpen(true)}>
          + Add Scenarios
        </Button>
      </div>
      
      <ScenarioSelectorModal
        open={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        onConfirm={handleScenarioConfirm}
        selectedScenarios={gameData.scenarios
          .map(id => allScenarios.find(s => s._id === id))
          .filter(Boolean)} // Filter out undefined scenarios
        allScenarios={allScenarios}
      />

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Save Escape Game
      </button>
    </form>
  );
};

export default EscapeGameForm;