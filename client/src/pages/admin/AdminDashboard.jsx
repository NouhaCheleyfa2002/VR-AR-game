import React from 'react';
import { useState, useMemo } from 'react';
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
  Select, Tooltip,
  MenuItem,
  Button,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

// Mock imports
import { mockSessions, feedbackData, defaultGames } from '../../assets/dummyData';
import GameplayChartsPanel from '../../components/gameplaySession/GameplayChartsPanel';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard = () => {
  // Gameplay Stats
  const totalSessions = mockSessions.length;
  const completedSessions = mockSessions.filter(s => s.endTime).length;

  //filtering
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  const filteredFeedbacks = useMemo(() => {
    if (!filter) return feedbackData;
    return feedbackData.filter((f) => Math.round(f.rating) === parseInt(filter));
  }, [filter]);

  // Feedback Stats
  const totalFeedbacks = feedbackData.length;
  const averageRating =
    totalFeedbacks > 0
      ? feedbackData.reduce((acc, f) => acc + f.rating, 0) / totalFeedbacks
      : 0;

  const ratingDistribution = [1, 2, 3, 4, 5].map((r) => ({
    name: `${r} Star`,
    value: feedbackData.filter((f) => Math.round(f.rating) === r).length,
  }));

  return (
    <Box p={4} marginLeft={5}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard Overview
      </Typography>
    
      <Grid container spacing={3}>
        {/* KPI Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader title="Total Players" />
            <CardContent>
              <Typography variant="h5">
                {
                  new Set(mockSessions.map(s => s.playerId)).size
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader title="Total Scenarios" />
            <CardContent>
              <Typography variant="h5">
                {
                  defaultGames.length // import defaultGames
                }
              </Typography>
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
                    {ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Filter by</InputLabel>
                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    label="Filter by"
                  >
                    <MenuItem value="">All Ratings</MenuItem>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <MenuItem key={star} value={star}>
                        {star} Stars
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              }
            />
            <CardContent sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {filteredFeedbacks.slice(0, 5).map((fb) => (
                <Box key={fb.feedbackId} mb={2} pb={1} borderBottom="1px solid #eee">
                  <Typography variant="subtitle2">
                    {fb.playerName || 'Anonymous'} –{' '}
                    {[...Array(5)].map((_, i) =>
                      i < fb.rating ? '⭐' : '☆'
                    )}
                  </Typography>
                  <Tooltip title={fb.comment} arrow>
                    <Typography variant="body2" noWrap>
                      {fb.comment}
                    </Typography>
                  </Tooltip>
                  <Typography variant="caption" color="text.disabled">
                    {new Date(fb.date).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </CardContent>
            <Box p={2} textAlign="right">
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/admin/feedbacks')}
              >
                View All
              </Button>
            </Box>
          </Card>
        </Grid>


      </Grid>
      <Box>
        <GameplayChartsPanel sessions={mockSessions} />
      </Box>

    </Box>
  );
};

export default AdminDashboard;
