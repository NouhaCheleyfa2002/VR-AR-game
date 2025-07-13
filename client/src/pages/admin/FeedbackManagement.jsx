import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Stack,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Delete,
  Search,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

// Import your API functions
import { getAllFeedbacks, deleteFeedback } from '../../api/FeedbackApi';

const FeedbackManagementPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const data = await getAllFeedbacks();
        setFeedbacks(data);
      } catch (error) {
        toast.error('Failed to load feedbacks');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    try {
      await deleteFeedback(id);
      setFeedbacks((prev) => prev.filter((f) => f.feedbackId !== id));
      toast.success('Feedback deleted');
    } catch (error) {
      toast.error('Failed to delete feedback');
      console.error(error);
    }
  };

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return feedbacks;
    return feedbacks.filter(
      (f) =>
        f.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.playerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, feedbacks]);

  const columns = [
    {
      field: 'playerName',
      headerName: 'Player',
      flex: 1,
      renderCell: ({ value }) => value || 'Anonymous',
    },
    {
      field: 'rating',
      headerName: 'Rating',
      flex: 1,
      sortable: false,
      renderCell: ({ value }) => (
        <>
          {[...Array(5)].map((_, i) =>
            i < value ? (
              <StarIcon key={i} fontSize="small" sx={{ color: '#fbc02d' }} />
            ) : (
              <StarBorderIcon key={i} fontSize="small" sx={{ color: '#ccc' }} />
            )
          )}
        </>
      ),
    },
    {
      field: 'comment',
      headerName: 'Comment',
      flex: 2,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ whiteSpace: 'normal' }}>
          {value}
        </Typography>
      ),
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      valueGetter: (params) => params.row.date || params.row.createdAt, // in case your backend uses createdAt
      renderCell: ({ value }) => (value ? format(new Date(value), 'PPPp') : ''),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(row.feedbackId)}>
              <Delete color="error" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Feedback Management
      </Typography>

      <TextField
        fullWidth
        placeholder="Search by player name or comment..."
        variant="outlined"
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <Box mt={2} sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filtered}
          getRowId={(row) => row.feedbackId}
          columns={columns}
          pageSize={8}
          rowsPerPageOptions={[5, 8, 10]}
          disableRowSelectionOnClick
          loading={loading}
          sx={{
            borderRadius: 2,
            boxShadow: 2,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default FeedbackManagementPage;
