import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  MenuItem,
  Button,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

// API imports
import { getAllSessions } from '../../api/GameplaySession';
import { getAllFeedbacks } from '../../api/FeedbackApi';
import { getAllEscapeGames } from '../../api/EscapeGameApi';
import GameplayChartsPanel from '../../components/gameplaySession/GameplayChartsPanel';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard = () => {
  const navigate = useNavigate();

  // State for data
  const [sessions, setSessions] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState('');

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionData, feedbackData, gameData] = await Promise.all([
          getAllSessions(),
          getAllFeedbacks(),
          getAllEscapeGames(),
        ]);
        setSessions(sessionData);
        setFeedbacks(feedbackData);
        setGames(gameData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  // Gameplay Stats
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.endTime).length;
  const totalPlayers = new Set(sessions.map(s => s.playerId)).size;
  const totalScenarios = games.length;

  // Feedback Stats
  const totalFeedbacks = feedbacks.length;
  const averageRating = totalFeedbacks
    ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
    : 0;
  const ratingDistribution = [1, 2, 3, 4, 5].map(r => ({
    name: `${r} Star`,
    value: feedbacks.filter(f => Math.round(f.rating) === r).length,
  }));

  const filteredFeedbacks = useMemo(() => {
    if (!filter) return feedbacks;
    return feedbacks.filter(f => Math.round(f.rating) === parseInt(filter, 10));
  }, [filter, feedbacks]);

  return (
    <Box p={4} ml={5}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        {/* KPI Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader title="Total Players" />
            <CardContent>
              <Typography variant="h5">{totalPlayers}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader title="Total Scenarios" />
            <CardContent>
              <Typography variant="h5">{totalScenarios}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader title="Total Sessions" />
            <CardContent>
              <Typography variant="h5">{totalSessions}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader title="Completed Sessions" />
            <CardContent>
              <Typography variant="h5">{completedSessions}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Feedback Distribution Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Rating Distribution" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={ratingDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {ratingDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <Typography variant="subtitle1">Total Feedbacks: {totalFeedbacks}</Typography>
              <Typography variant="subtitle1">Average Rating: {averageRating.toFixed(1)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} width={650}>
          <Card sx={{ height: 370, display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title="Latest Feedbacks"
              action={
                <FormControl size="small" sx={{ minWidth: 120,  }}>
                  <InputLabel>Filter by</InputLabel>
                  <Select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    label="Filter by"
                  >
                    <MenuItem value="">All Ratings</MenuItem>
                    {[5, 4, 3, 2, 1].map(star => (
                      <MenuItem key={star} value={star}>{`${star} Stars`}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              }
            />
            <CardContent sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {filteredFeedbacks.slice(0, 5).map(fb => (
                <Box key={fb.feedbackId} mb={2} pb={1} borderBottom="1px solid #eee">
                  <Typography variant="subtitle2">
                    {fb.playerId.email || 'Anonymous'} – {' '}
                    {[...Array(5)].map((_, i) => (i < fb.rating ? '⭐' : '☆'))}
                  </Typography>
                  <Tooltip title={fb.comment} arrow>
                    <Typography variant="body2" noWrap>
                      {fb.comment}
                    </Typography>
                  </Tooltip>
                  <Typography variant="caption" color="text.disabled">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </CardContent>
            <Box p={2} textAlign="right">
              <Button variant="text" size="small" onClick={() => navigate('/admin/feedbacks')}>
                View All
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <GameplayChartsPanel sessions={sessions} />
      </Box>
    </Box>
  );
};

export default AdminDashboard;