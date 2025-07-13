import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Paper,
} from '@mui/material';

const GameplaySessionList = ({ sessions, onSelectSession }) => {
  if (!sessions || sessions.length === 0) {
    return <Typography>No gameplay sessions found.</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 2, width: 1100 }}>
      <Typography variant="h6" gutterBottom>
        Session History
      </Typography>
      <List>
        {sessions.map((session) => (
          <ListItem key={session._id} disablePadding>
            <ListItemButton onClick={() => onSelectSession(session)}>
              <ListItemText
                primary={`Session ID: ${session._id}`}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      Game ID: {session.gameId} | Room: {session.roomId}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="text.secondary">
                      Score: {session.totalScore} | Hints Used: {session.hintsUsed}
                    </Typography>
                  </>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default GameplaySessionList;