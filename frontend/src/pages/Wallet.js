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
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SendIcon from '@mui/icons-material/Send';
import CallReceivedIcon from '@mui/icons-material/CallReceived';

const Wallet = () => {
  const [balances, setBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading wallet data
    setTimeout(() => {
      setBalances([
        { currency: 'BTC', available: 0.5432, locked: 0.0123, symbol: '₿' },
        { currency: 'ETH', available: 12.8765, locked: 1.2345, symbol: 'Ξ' },
        { currency: 'USDT', available: 15420.50, locked: 0, symbol: '$' },
        { currency: 'BNB', available: 45.67, locked: 5.33, symbol: 'BNB' },
      ]);
      
      setTransactions([
        { id: 1, type: 'deposit', currency: 'USDT', amount: 1000, status: 'completed', date: '2023-10-23' },
        { id: 2, type: 'withdrawal', currency: 'BTC', amount: 0.1, status: 'pending', date: '2023-10-22' },
        { id: 3, type: 'trade', currency: 'ETH', amount: 5.5, status: 'completed', date: '2023-10-21' },
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

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

  const totalValue = balances.reduce((sum, balance) => {
    // Mock price calculation (in real app, fetch from API)
    const mockPrices = { BTC: 45000, ETH: 2800, USDT: 1, BNB: 320 };
    const price = mockPrices[balance.currency] || 0;
    return sum + ((balance.available + balance.locked) * price);
  }, 0);

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
        Your Wallet
      </Typography>

      <Grid container spacing={3}>
        {/* Total Portfolio Value */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 215, 0, 0.1))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              mb: 3,
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 48, color: '#00d4ff', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Total Portfolio Value
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 'bold', color: '#00d4ff', mb: 2 }}
              >
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<CallReceivedIcon />}
                  sx={{
                    background: 'linear-gradient(45deg, #4caf50, #45a049)',
                    '&:hover': { background: 'linear-gradient(45deg, #45a049, #3d8b40)' },
                  }}
                >
                  Deposit
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  sx={{
                    background: 'linear-gradient(45deg, #f44336, #d32f2f)',
                    '&:hover': { background: 'linear-gradient(45deg, #d32f2f, #b71c1c)' },
                  }}
                >
                  Withdraw
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Balances */}
        <Grid item xs={12} md={8}>
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
              Your Balances
            </Typography>
            <Grid container spacing={2}>
              {balances.map((balance, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card
                    sx={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {balance.currency}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Available: {balance.available.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Locked: {balance.locked.toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ color: '#ffd700' }}>
                          {balance.symbol}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
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
              Recent Transactions
            </Typography>
            <List>
              {transactions.map((transaction, index) => (
                <Box key={transaction.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} - {transaction.currency}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              color: transaction.type === 'deposit' ? '#4caf50' : 
                                     transaction.type === 'withdrawal' ? '#f44336' : '#00d4ff'
                            }}
                          >
                            {transaction.type === 'withdrawal' ? '-' : '+'}{transaction.amount} {transaction.currency}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box display="flex" justifyContent="space-between" mt={1}>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.date}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: transaction.status === 'completed' ? '#4caf50' : '#ffd700',
                              textTransform: 'capitalize'
                            }}
                          >
                            {transaction.status}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < transactions.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Wallet;