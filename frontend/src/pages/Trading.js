import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const Trading = () => {
  const [marketData, setMarketData] = useState([]);
  const [orderForm, setOrderForm] = useState({
    pair: 'BTC/USDT',
    type: 'buy',
    amount: '',
    price: '',
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading market data
    setTimeout(() => {
      setMarketData([
        { pair: 'BTC/USDT', price: 45230.50, change: 2.34, volume: '1.2B' },
        { pair: 'ETH/USDT', price: 2845.75, change: -1.23, volume: '890M' },
        { pair: 'BNB/USDT', price: 320.45, change: 4.56, volume: '234M' },
        { pair: 'ADA/USDT', price: 0.6789, change: -3.21, volume: '567M' },
        { pair: 'SOL/USDT', price: 89.34, change: 6.78, volume: '345M' },
      ]);

      setOrders([
        { id: 1, pair: 'BTC/USDT', type: 'buy', amount: 0.1, price: 45000, status: 'open' },
        { id: 2, pair: 'ETH/USDT', type: 'sell', amount: 2.5, price: 2900, status: 'filled' },
        { id: 3, pair: 'BNB/USDT', type: 'buy', amount: 10, price: 315, status: 'cancelled' },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const handleOrderChange = (e) => {
    setOrderForm({
      ...orderForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    // In a real app, this would make an API call
    console.log('Submitting order:', orderForm);
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
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
        Trading Center
      </Typography>

      <Grid container spacing={3}>
        {/* Market Overview */}
        <Grid item xs={12} lg={8}>
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
              Market Overview
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Pair</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Price</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>24h Change</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Volume</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {marketData.map((item, index) => (
                    <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' } }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{item.pair}</TableCell>
                      <TableCell>${item.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {item.change > 0 ? (
                            <TrendingUpIcon sx={{ color: '#4caf50', mr: 1 }} />
                          ) : (
                            <TrendingDownIcon sx={{ color: '#f44336', mr: 1 }} />
                          )}
                          <Typography
                            sx={{
                              color: item.change > 0 ? '#4caf50' : '#f44336',
                              fontWeight: 'bold',
                            }}
                          >
                            {item.change > 0 ? '+' : ''}{item.change}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{item.volume}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            borderColor: '#00d4ff',
                            color: '#00d4ff',
                            '&:hover': {
                              borderColor: '#0099cc',
                              backgroundColor: 'rgba(0, 212, 255, 0.1)',
                            },
                          }}
                        >
                          Trade
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Order Form */}
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(26, 31, 46, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Place Order
            </Typography>
            <Box component="form" onSubmit={handleSubmitOrder}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Trading Pair</InputLabel>
                <Select
                  name="pair"
                  value={orderForm.pair}
                  onChange={handleOrderChange}
                  label="Trading Pair"
                >
                  <MenuItem value="BTC/USDT">BTC/USDT</MenuItem>
                  <MenuItem value="ETH/USDT">ETH/USDT</MenuItem>
                  <MenuItem value="BNB/USDT">BNB/USDT</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Order Type</InputLabel>
                <Select
                  name="type"
                  value={orderForm.type}
                  onChange={handleOrderChange}
                  label="Order Type"
                >
                  <MenuItem value="buy">Buy</MenuItem>
                  <MenuItem value="sell">Sell</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                name="amount"
                label="Amount"
                type="number"
                value={orderForm.amount}
                onChange={handleOrderChange}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                name="price"
                label="Price (USDT)"
                type="number"
                value={orderForm.price}
                onChange={handleOrderChange}
                margin="normal"
                required
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  py: 1.5,
                  background: orderForm.type === 'buy' 
                    ? 'linear-gradient(45deg, #4caf50, #45a049)'
                    : 'linear-gradient(45deg, #f44336, #d32f2f)',
                  '&:hover': {
                    background: orderForm.type === 'buy'
                      ? 'linear-gradient(45deg, #45a049, #3d8b40)'
                      : 'linear-gradient(45deg, #d32f2f, #b71c1c)',
                  },
                }}
              >
                {orderForm.type === 'buy' ? 'Buy' : 'Sell'} {orderForm.pair.split('/')[0]}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Order History */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(26, 31, 46, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
            }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Order History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Pair</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Price</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' } }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{order.pair}</TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            color: order.type === 'buy' ? '#4caf50' : '#f44336',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                          }}
                        >
                          {order.type}
                        </Typography>
                      </TableCell>
                      <TableCell>{order.amount}</TableCell>
                      <TableCell>${order.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            color: order.status === 'filled' ? '#4caf50' : 
                                   order.status === 'open' ? '#ffd700' : '#f44336',
                            textTransform: 'capitalize',
                            fontWeight: 'bold',
                          }}
                        >
                          {order.status}
                        </Typography>
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

export default Trading;