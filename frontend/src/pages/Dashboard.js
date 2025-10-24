import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DiamondIcon from '@mui/icons-material/Diamond';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBalance: 0,
    activeOrders: 0,
    miningRewards: 0,
    tradingVolume: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalBalance: 12500.75,
        activeOrders: 3,
        miningRewards: 145.32,
        tradingVolume: 8750.00,
      });
      setLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      title: 'Total Balance',
      value: `$${stats.totalBalance.toLocaleString()}`,
      icon: <AccountBalanceWalletIcon fontSize="large" />,
      color: '#00d4ff',
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      icon: <SwapHorizIcon fontSize="large" />,
      color: '#ffd700',
    },
    {
      title: 'Mining Rewards',
      value: `$${stats.miningRewards.toLocaleString()}`,
      icon: <DiamondIcon fontSize="large" />,
      color: '#ff6b6b',
    },
    {
      title: 'Trading Volume',
      value: `$${stats.tradingVolume.toLocaleString()}`,
      icon: <TrendingUpIcon fontSize="large" />,
      color: '#4ecdc4',
    },
  ];

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
        Welcome back, {user?.name}!
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: 'rgba(26, 31, 46, 0.8)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${stat.color}33`,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  border: `1px solid ${stat.color}66`,
                },
              }}
            >
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 'bold', color: stat.color }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(26, 31, 46, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
            }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Recent Activity
            </Typography>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No recent activity to display
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(26, 31, 46, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
            }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Quick action buttons coming soon
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;