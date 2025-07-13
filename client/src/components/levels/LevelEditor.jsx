import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createLevel, updateLevel, getAllLevels } from '../../api/LevelApi'; // Adjust path as needed
import { getAllScenarios } from '../../api/ScenarioApi'; // You'll need this API too
import { getAllPuzzles } from '../../api/PuzzleApi'; // Import your puzzle API

const LevelEditor = ({ initialData = null, onSave, onCancel, scenarioId = null }) => {
  const [levelData, setLevelData] = useState(
    initialData || {
      scenarioId: scenarioId || '',
      levelNumber: 1,
      title: '',
      description: '',
      difficulty: '',
      timeLimit: 30,
      reward: '',
      culturalElement: '',
      puzzle: '',
      scene: '',
    }
  );

  const [scenarios, setScenarios] = useState([]);
  const [puzzles, setPuzzles] = useState([]);
  const [difficultyOptions, setDifficultyOptions] = useState([]);
  const [culturalOptions, setCulturalOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [scenariosData, puzzlesData, levelsData] = await Promise.all([
          getAllScenarios(),
          getAllPuzzles(),
          getAllLevels()
        ]);
        
        setScenarios(scenariosData);
        setPuzzles(puzzlesData);
        
        // Extract unique difficulty options from existing levels
        const uniqueDifficulties = new Set();
        levelsData.forEach(level => {
          if (level.difficulty) {
            uniqueDifficulties.add(level.difficulty);
          }
        });
        setDifficultyOptions(Array.from(uniqueDifficulties));
        
        // Extract unique cultural elements from existing levels
        const uniqueCulturalElements = new Set();
        levelsData.forEach(level => {
          if (level.culturalElement) {
            uniqueCulturalElements.add(level.culturalElement);
          }
        });
        setCulturalOptions(Array.from(uniqueCulturalElements));
        
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load required data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLevelData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { scenarioId, title, description, difficulty, timeLimit, culturalElement } = levelData;

    if (!scenarioId || !title || !description || !difficulty || !timeLimit || !culturalElement) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      let result;
      const submitData = {
        ...levelData,
        timeLimit: parseInt(levelData.timeLimit),
        levelNumber: parseInt(levelData.levelNumber),
        // Only include puzzle and scene if they have values
        ...(levelData.puzzle && { puzzle: levelData.puzzle }),
        ...(levelData.scene && { scene: levelData.scene })
      };

      if (initialData) {
        // Update existing level
        result = await updateLevel(initialData._id, submitData);
        toast.success('Level updated successfully');
      } else {
        // Create new level
        result = await createLevel(submitData);
        toast.success('Level created successfully');
      }

      onSave(result);
    } catch (error) {
      console.error('Error saving level:', error);
      toast.error(initialData ? 'Failed to update level' : 'Failed to create level');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 p-6 bg-white rounded-xl shadow-lg max-w-2xl mx-auto"
    >
      <h2 className="text-xl font-bold text-blue-700">
        {initialData ? 'Edit Level' : 'Create New Level'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Level Number</label>
          <input
            type="number"
            name="levelNumber"
            value={levelData.levelNumber}
            onChange={handleChange}
            min={1}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Time Limit (minutes)</label>
          <input
            type="number"
            name="timeLimit"
            value={levelData.timeLimit}
            onChange={handleChange}
            min={5}
            max={180}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300"
            required
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1">Scenario *</label>
        <select
          name="scenarioId"
          value={levelData.scenarioId}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300"
          required
        >
          <option value="">Select a scenario</option>
          {scenarios.map((scenario) => (
            <option key={scenario._id} value={scenario._id}>
              {scenario.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1">Title *</label>
        <input
          type="text"
          name="title"
          value={levelData.title}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Description *</label>
        <textarea
          name="description"
          value={levelData.description}
          onChange={handleChange}
          rows={3}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Difficulty *</label>
        <select
          name="difficulty"
          value={levelData.difficulty}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300"
          required
        >
          <option value="">Select difficulty</option>
          {difficultyOptions.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1">Reward</label>
        <input
          type="text"
          name="reward"
          value={levelData.reward}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Cultural Element *</label>
        <select
          name="culturalElement"
          value={levelData.culturalElement}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300"
          required
        >
          <option value="">Select cultural context</option>
          {culturalOptions.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1">Puzzle (Optional)</label>
        <select
          name="puzzle"
          value={levelData.puzzle}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Select a puzzle</option>
          {puzzles.map((puzzle) => (
            <option key={puzzle._id} value={puzzle._id}>
              {puzzle.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1">Scene (Optional)</label>
        <input
          type="text"
          name="scene"
          value={levelData.scene}
          onChange={handleChange}
          placeholder="Scene ID will be linked here"
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300"
        />
      </div>

      <div className="flex justify-end gap-3 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded text-gray-600 hover:underline"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition disabled:bg-gray-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default LevelEditor;