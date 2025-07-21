import React from 'react';
import {
  Box,
  Typography,
  Grid,
  useTheme,
  Paper,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#00acc1'];

const GameplayChartsPanel = ({ sessions = [] }) => {
  const theme = useTheme();

  // Early return if no sessions
  if (!sessions || sessions.length === 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Gameplay Insights
        </Typography>
        <Alert severity="info">
          No session data available to display charts. Create some gameplay sessions to see analytics.
        </Alert>
      </Box>
    );
  }

  // Score Distribution
  const scoreBuckets = [0, 20, 40, 60, 80, 100];
  const scoreDistribution = scoreBuckets.map((min, i) => {
    const max = scoreBuckets[i + 1] || 120;
    const count = sessions.filter(s => (s.totalScore || 0) >= min && (s.totalScore || 0) < max).length;
    return { range: `${min}-${max - 1}`, count };
  });

  // Hints Used per Session (show only first 20 sessions for readability)
  const hintsData = sessions.slice(0, 20).map((s, i) => ({
    name: `Session ${i + 1}`,
    hints: s.hintsUsed.length || 0,
  }));

  // Preferred Difficulty
  const difficultyCount = sessions.reduce((acc, s) => {
    const diff = s.preferredDifficulty || 'Unknown';
    acc[diff] = (acc[diff] || 0) + 1;
    return acc;
  }, {});
  const difficultyData = Object.entries(difficultyCount).map(([name, value]) => ({
    name,
    value,
  }));

  // Session Volume Over Time
  const sessionVolume = sessions.reduce((acc, s) => {
    const date = s.startTime ? new Date(s.startTime).toLocaleDateString() : 'Unknown';
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const sessionVolumeData = Object.entries(sessionVolume)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Average Score Per Game
  const scoresPerGame = {};
  sessions.forEach((s) => {
    const gameId = s.gameId.title || 'Unknown';
    if (!scoresPerGame[gameId]) {
      scoresPerGame[gameId] = { total: 0, count: 0 };
    }
    scoresPerGame[gameId].total += s.totalScore || 0;
    scoresPerGame[gameId].count += 1;
  });
  const averageScoreData = Object.entries(scoresPerGame).map(([gameId, { total, count }]) => ({
    gameId: gameId > 8 ? `${gameId.substring(0, 8)}...` : gameId,
    average: parseFloat((total / count).toFixed(1)),
  }));

  // Top-Performing Players
  const scoreByPlayer = {};
  sessions.forEach((s) => {
    const player = s.playerId.email || 'Unknown';
    scoreByPlayer[player] = (scoreByPlayer[player] || 0) + (s.totalScore || 0);
  });
  const topPlayers = Object.entries(scoreByPlayer)
    .map(([playerId, totalScore]) => ({ 
      playerId: playerId.length > 10 ? `${playerId.substring(0, 10)}...` : playerId, 
      totalScore 
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 5);

  const ChartContainer = ({ title, children }) => (
    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom color="primary">
        {title}
      </Typography>
      {children}
    </Paper>
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Gameplay Insights
      </Typography>

      <Grid container spacing={3}>
        {/* Score Distribution */}
        <Grid item xs={12} md={6}>
          <ChartContainer title="Score Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>

        {/* Hints Used */}
        <Grid item xs={12} md={6}>
          <ChartContainer title="Hints Used per Session">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hintsData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="hints" stroke={theme.palette.warning.main} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>

        {/* Preferred Difficulty */}
        <Grid item xs={12} md={6}>
          <ChartContainer title="Preferred Difficulty">
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {difficultyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </ChartContainer>
        </Grid>

        {/* Session Volume Over Time */}
        <Grid item xs={12} md={6}>
          <ChartContainer title="Session Volume Over Time">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sessionVolumeData}>
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke={theme.palette.success.main} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>

        {/* Average Score per Game */}
        <Grid item xs={12} md={6}>
          <ChartContainer title="Average Score per Game">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={averageScoreData}>
                <XAxis dataKey="gameId" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill={theme.palette.secondary.main} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>

        {/* Top-Performing Players */}
        <Grid item xs={12} md={6}>
          <ChartContainer title="Top-Performing Players">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPlayers}>
                <XAxis dataKey="playerId" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalScore" fill={theme.palette.error.main} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GameplayChartsPanel;