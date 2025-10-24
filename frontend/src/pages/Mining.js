import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
} from '@mui/material';
import DiamondIcon from '@mui/icons-material/Diamond';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';

const Mining = () => {
  const [miningStats, setMiningStats] = useState({
    isActive: false,
    hashRate: 0,
    totalRewards: 0,
    dailyRewards: 0,
    power: 85,
  });
  const [miningHistory, setMiningHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading mining data
    setTimeout(() => {
      setMiningStats({
        isActive: true,
        hashRate: 125.67,
        totalRewards: 0.02456789,
        dailyRewards: 0.00123456,
        power: 85,
      });

      setMiningHistory([
        { id: 1, date: '2023-10-23', reward: 0.00123456, currency: 'BTC', status: 'completed' },
        { id: 2, date: '2023-10-22', reward: 0.00134567, currency: 'BTC', status: 'completed' },
        { id: 3, date: '2023-10-21', reward: 0.00145678, currency: 'BTC', status: 'completed' },
        { id: 4, date: '2023-10-20', reward: 0.00156789, currency: 'BTC', status: 'completed' },
        { id: 5, date: '2023-10-19', reward: 0.00167890, currency: 'BTC', status: 'pending' },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const handleStartMining = () => {
    setMiningStats(prev => ({ ...prev, isActive: true }));
  };

  const handleStopMining = () => {
    setMiningStats(prev => ({ ...prev, isActive: false }));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h3"
        sx={{
          mb: 4,
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #00d4ff, #ffd700)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Cloud Mining
      </Typography>

      <Grid container spacing={3}>
        {/* Mining Status */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: miningStats.isActive 
                ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))'
                : 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(255, 87, 34, 0.1))',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${miningStats.isActive ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
              mb: 3,
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <DiamondIcon 
                sx={{ 
                  fontSize: 64, 
                  color: miningStats.isActive ? '#4caf50' : '#f44336', 
                  mb: 2,
                  animation: miningStats.isActive ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                    '100%': { opacity: 1 },
                  },
                }} 
              />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                Mining Status
              </Typography>
              <Chip
                label={miningStats.isActive ? 'ACTIVE' : 'STOPPED'}
                color={miningStats.isActive ? 'success' : 'error'}
                sx={{ fontSize: '1.2rem', px: 2, py: 1, mb: 3 }}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                {!miningStats.isActive ? (
                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleStartMining}
                    sx={{
                      background: 'linear-gradient(45deg, #4caf50, #45a049)',
                      '&:hover': { background: 'linear-gradient(45deg, #45a049, #3d8b40)' },
                    }}
                  >
                    Start Mining
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<PauseIcon />}
                      sx={{
                        background: 'linear-gradient(45deg, #ff9800, #f57c00)',
                        '&:hover': { background: 'linear-gradient(45deg, #f57c00, #ef6c00)' },
                      }}
                    >
                      Pause
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<StopIcon />}
                      onClick={handleStopMining}
                      sx={{
                        background: 'linear-gradient(45deg, #f44336, #d32f2f)',
                        '&:hover': { background: 'linear-gradient(45deg, #d32f2f, #b71c1c)' },
                      }}
                    >
                      Stop
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Mining Stats */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(26, 31, 46, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Mining Statistics
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Hash Rate
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#00d4ff' }}>
                {miningStats.hashRate} TH/s
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Power Efficiency
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={miningStats.power}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#4caf50',
                    },
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {miningStats.power}%
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Total Rewards
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ffd700' }}>
                {miningStats.totalRewards} BTC
              </Typography>
            </Box>

            <Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Daily Rewards
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ffd700' }}>
                {miningStats.dailyRewards} BTC
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Mining History */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(26, 31, 46, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
            }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Mining History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Reward</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Currency</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>USD Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {miningHistory.map((record) => (
                    <TableRow key={record.id} sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' } }}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#ffd700' }}>
                        {record.reward} {record.currency}
                      </TableCell>
                      <TableCell>{record.currency}</TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={record.status === 'completed' ? 'success' : 'warning'}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        ${(record.reward * 45000).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Mining;