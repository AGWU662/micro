const axios = require('axios');
const cron = require('node-cron');

class PriceService {
  constructor() {
    this.prices = {
      'BTC/USDT': { price: 43250.50, change24h: 2.5 },
      'ETH/USDT': { price: 2280.75, change24h: 3.2 },
      'BTC/ETH': { price: 18.95, change24h: -0.8 },
      'LTC/USDT': { price: 72.40, change24h: 1.5 },
      'XRP/USDT': { price: 0.5234, change24h: 4.2 }
    };
    this.subscribers = [];
    this.isRunning = false;
  }

  // Subscribe to price updates
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notify all subscribers
  notifySubscribers(prices) {
    this.subscribers.forEach(callback => {
      try {
        callback(prices);
      } catch (error) {
        console.error('Error notifying price subscriber:', error);
      }
    });
  }

  // Fetch prices from CoinGecko API (free tier)
  async fetchPricesFromAPI() {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'bitcoin,ethereum,litecoin,ripple',
          vs_currencies: 'usd',
          include_24hr_change: true,
        },
        timeout: 10000,
      });

      const data = response.data;
      
      // Update prices with real data
      if (data.bitcoin) {
        this.prices['BTC/USDT'] = {
          price: data.bitcoin.usd,
          change24h: data.bitcoin.usd_24h_change || 0,
        };
      }

      if (data.ethereum) {
        this.prices['ETH/USDT'] = {
          price: data.ethereum.usd,
          change24h: data.ethereum.usd_24h_change || 0,
        };
        
        // Calculate BTC/ETH pair
        if (data.bitcoin && data.ethereum) {
          const btcEthPrice = data.bitcoin.usd / data.ethereum.usd;
          this.prices['BTC/ETH'] = {
            price: btcEthPrice,
            change24h: (data.bitcoin.usd_24h_change || 0) - (data.ethereum.usd_24h_change || 0),
          };
        }
      }

      if (data.litecoin) {
        this.prices['LTC/USDT'] = {
          price: data.litecoin.usd,
          change24h: data.litecoin.usd_24h_change || 0,
        };
      }

      if (data.ripple) {
        this.prices['XRP/USDT'] = {
          price: data.ripple.usd,
          change24h: data.ripple.usd_24h_change || 0,
        };
      }

      console.log('Prices updated successfully');
      return this.prices;
    } catch (error) {
      console.error('Error fetching prices from API:', error.message);
      // Return current prices if API fails
      return this.prices;
    }
  }

  // Generate simulated price movements (fallback)
  generateSimulatedPrices() {
    const pairs = Object.keys(this.prices);
    
    pairs.forEach(pair => {
      const currentPrice = this.prices[pair];
      // Generate random price movement between -2% and +2%
      const changePercent = (Math.random() - 0.5) * 4;
      const newPrice = currentPrice.price * (1 + changePercent / 100);
      
      this.prices[pair] = {
        price: Number(newPrice.toFixed(pair.includes('XRP') ? 4 : 2)),
        change24h: currentPrice.change24h + (Math.random() - 0.5) * 0.5,
      };
    });

    return this.prices;
  }

  // Get current prices
  getCurrentPrices() {
    return { ...this.prices };
  }

  // Get specific pair price
  getPairPrice(pair) {
    return this.prices[pair] || null;
  }

  // Start price monitoring
  startPriceMonitoring(io) {
    if (this.isRunning) {
      console.log('Price monitoring already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting price monitoring service...');

    // Update prices every 30 seconds
    const updatePrices = async () => {
      try {
        const prices = await this.fetchPricesFromAPI();
        
        // Emit to all connected clients
        if (io) {
          io.emit('priceUpdate', prices);
        }

        // Notify subscribers
        this.notifySubscribers(prices);
      } catch (error) {
        console.error('Error in price update cycle:', error);
      }
    };

    // Initial update
    updatePrices();

    // Schedule regular updates every 30 seconds
    this.priceUpdateInterval = setInterval(updatePrices, 30000);

    // Schedule API updates every 2 minutes (to respect rate limits)
    cron.schedule('*/2 * * * *', async () => {
      if (this.isRunning) {
        await updatePrices();
      }
    });

    console.log('Price monitoring started - updating every 30 seconds');
  }

  // Stop price monitoring
  stopPriceMonitoring() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
    }
    this.isRunning = false;
    console.log('Price monitoring stopped');
  }

  // Get trading pairs with current prices
  getTradingPairs() {
    return Object.keys(this.prices).map(pair => {
      const [base, quote] = pair.split('/');
      return {
        pair,
        base,
        quote,
        price: this.prices[pair].price,
        change24h: this.prices[pair].change24h,
      };
    });
  }
}

// Create singleton instance
const priceService = new PriceService();

module.exports = priceService;