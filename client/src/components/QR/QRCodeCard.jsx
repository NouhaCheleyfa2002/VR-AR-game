// components/qrcode/QRCodeCard.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Divider,
  Tooltip,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import QrCode2Icon from '@mui/icons-material/QrCode2';

const QRCodeCard = ({ code }) => {
  const isExpired = new Date(code.expirationTime) < new Date();
  const remainingScans = code.maxScans - code.scans;
  const scanLimitReached = remainingScans <= 0;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        p: 2,
        position: 'relative',
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <QrCode2Icon color="primary" />
          <Typography variant="h6">QR Code #{code.codeId}</Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Typography variant="body1">
          <strong>Room:</strong> {code.roomId}
        </Typography>
        <Typography variant="body1">
          <strong>Game:</strong> {code.gameId}
        </Typography>
        <Typography variant="body1">
          <strong>Cultural Element:</strong> {code.culturalElementId}
        </Typography>

        <Typography variant="body2" color="text.secondary" mt={1}>
          {code.content}
        </Typography>

        <Box display="flex" gap={1} mt={2} flexWrap="wrap">
          <Tooltip title="Expiration Time">
            <Chip
              icon={<AccessTimeIcon />}
              label={new Date(code.expirationTime).toLocaleString()}
              color={isExpired ? 'error' : 'default'}
              variant="outlined"
            />
          </Tooltip>

          <Tooltip title="Scans Used">
            <Chip
              icon={<GroupIcon />}
              label={`Scans: ${code.scans}/${code.maxScans}`}
              color={scanLimitReached ? 'warning' : 'success'}
              variant="outlined"
            />
          </Tooltip>

          <Chip
            icon={isExpired || scanLimitReached ? <ErrorIcon /> : <CheckCircleIcon />}
            label={
              isExpired
                ? 'Expired'
                : scanLimitReached
                ? 'Limit Reached'
                : 'Valid'
            }
            color={isExpired || scanLimitReached ? 'error' : 'success'}
            variant="filled"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default QRCodeCard;
