import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <TrendingUpIcon fontSize="large" color="primary" />,
      title: 'Advanced Trading',
      description: 'Trade cryptocurrencies with advanced tools and real-time market data.',
    },
    {
      icon: <SecurityIcon fontSize="large" color="primary" />,
      title: 'Secure Platform',
      description: 'Bank-level security with multi-factor authentication and cold storage.',
    },
    {
      icon: <AccountBalanceWalletIcon fontSize="large" color="primary" />,
      title: 'Digital Wallet',
      description: 'Secure wallet to store and manage your cryptocurrency portfolio.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 100%)' }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box
          sx={{
            pt: { xs: 8, md: 12 },
            pb: { xs: 6, md: 8 },
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 'bold',
              mb: 3,
              background: 'linear-gradient(45deg, #00d4ff, #ffd700)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Elite -cloud-mine
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.2rem', md: '1.8rem' },
              mb: 4,
              color: 'text.secondary',
              maxWidth: '800px',
              mx: 'auto',
            }}
          >
            The future of cryptocurrency trading and mining. Secure, fast, and user-friendly platform for all your crypto needs.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
              }}
            >
              Get Started
            </Button>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderColor: '#00d4ff',
                color: '#00d4ff',
              }}
            >
              Login
            </Button>
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              textAlign: 'center',
              mb: 6,
              fontWeight: 'bold',
            }}
          >
            Why Choose Us?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'rgba(26, 31, 46, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      border: '1px solid rgba(0, 212, 255, 0.5)',
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            py: { xs: 6, md: 8 },
            textAlign: 'center',
            background: 'rgba(0, 212, 255, 0.1)',
            borderRadius: 4,
            mb: 8,
          }}
        >
          <Typography variant="h3" sx={{ mb: 3, fontWeight: 'bold' }}>
            Ready to Start Trading?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
            Join thousands of users who trust Elite -cloud-mine with their crypto investments.
          </Typography>
          <Button
            component={Link}
            to="/register"
            variant="contained"
            size="large"
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              background: 'linear-gradient(45deg, #ffd700, #ffb347)',
              color: '#000',
              fontWeight: 'bold',
            }}
          >
            Create Account
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;