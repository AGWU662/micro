import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './Trading.css';

const Trading = () => {
  const [activePair, setActivePair] = useState('BTC/USDT');
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [recentTrades, setRecentTrades] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [balance, setBalance] = useState({});
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);

  const tradingPairs = [
    'BTC/USDT', 'ETH/USDT', 'BTC/ETH', 'LTC/USDT', 
    'ADA/USDT', 'DOT/USDT', 'LINK/USDT', 'UNI/USDT'
  ];

  useEffect(() => {
    fetchTradingData();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, [activePair]);

  const fetchTradingData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch balance
      const balanceRes = await fetch('/api/wallet', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData.wallet?.balances || {});
      }

      // Fetch user orders
      const ordersRes = await fetch('/api/trading/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setUserOrders(ordersData.orders || []);
      }

      // Fetch order book
      const bookRes = await fetch(`/api/trading/orderbook/${activePair}`);
      if (bookRes.ok) {
        const bookData = await bookRes.json();
        setOrderBook(bookData.orderBook || { bids: [], asks: [] });
      }

      // Fetch recent trades
      const tradesRes = await fetch(`/api/trading/trades/${activePair}?limit=20`);
      if (tradesRes.ok) {
        const tradesData = await tradesRes.json();
        setRecentTrades(tradesData.trades || []);
      }

    } catch (error) {
      console.error('Error fetching trading data:', error);
    }
  };

  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/trading/prices');
      if (response.ok) {
        const data = await response.json();
        setPrices(data.prices || {});
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const [base, quote] = activePair.split('/');
      
      const orderData = {
        symbol: activePair,
        side,
        type: orderType,
        amount: parseFloat(amount),
        ...(orderType === 'limit' && { price: parseFloat(price) })
      };

      const response = await fetch('/api/trading/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`${side.toUpperCase()} order placed successfully!`);
        setAmount('');
        setPrice('');
        fetchTradingData();
      } else {
        toast.error(result.message || 'Failed to place order');
      }
    } catch (error) {
      toast.error('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/trading/order/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Order cancelled successfully');
        fetchTradingData();
      } else {
        toast.error(result.message || 'Failed to cancel order');
      }
    } catch (error) {
      toast.error('Error cancelling order');
    }
  };

  const formatPrice = (value) => {
    return parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  };

  const getBalance = (currency) => {
    const currencyBalance = balance.find(b => b.currency === currency);
    return currencyBalance ? currencyBalance.available : 0;
  };

  const getCurrentPrice = () => {
    const [base] = activePair.split('/');
    return prices[base.toLowerCase()] || 0;
  };

  return (
    <div className="trading-page">
      <div className="trading-header">
        <h1>Elite-cloud Trading</h1>
        <div className="pair-selector">
          <select 
            value={activePair} 
            onChange={(e) => setActivePair(e.target.value)}
            className="pair-select"
          >
            {tradingPairs.map(pair => (
              <option key={pair} value={pair}>{pair}</option>
            ))}
          </select>
          <div className="price-display">
            <span className="current-price">${formatPrice(getCurrentPrice())}</span>
            <span className="price-change positive">+2.45%</span>
          </div>
        </div>
      </div>

      <div className="trading-content">
        {/* Trading Form */}
        <div className="trading-panel">
          <div className="panel-header">
            <h3>Place Order</h3>
            <div className="order-tabs">
              <button 
                className={`tab ${side === 'buy' ? 'active buy' : ''}`}
                onClick={() => setSide('buy')}
              >
                Buy
              </button>
              <button 
                className={`tab ${side === 'sell' ? 'active sell' : ''}`}
                onClick={() => setSide('sell')}
              >
                Sell
              </button>
            </div>
          </div>

          <form onSubmit={handlePlaceOrder} className="order-form">
            <div className="order-type">
              <label>Order Type</label>
              <div className="type-tabs">
                <button
                  type="button"
                  className={`type-tab ${orderType === 'market' ? 'active' : ''}`}
                  onClick={() => setOrderType('market')}
                >
                  Market
                </button>
                <button
                  type="button"
                  className={`type-tab ${orderType === 'limit' ? 'active' : ''}`}
                  onClick={() => setOrderType('limit')}
                >
                  Limit
                </button>
              </div>
            </div>

            {orderType === 'limit' && (
              <div className="form-group">
                <label>Price ({activePair.split('/')[1]})</label>
                <input
                  type="number"
                  step="0.00000001"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Amount ({activePair.split('/')[0]})</label>
              <input
                type="number"
                step="0.00000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
              <div className="balance-info">
                Available: {formatPrice(getBalance(side === 'buy' ? activePair.split('/')[1] : activePair.split('/')[0]))} 
                {side === 'buy' ? activePair.split('/')[1] : activePair.split('/')[0]}
              </div>
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Total</span>
                <span>
                  {orderType === 'market' 
                    ? formatPrice(amount * getCurrentPrice()) 
                    : formatPrice(amount * price)
                  } {activePair.split('/')[1]}
                </span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !amount}
              className={`order-btn ${side} ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Placing Order...' : `${side.toUpperCase()} ${activePair.split('/')[0]}`}
            </button>
          </form>
        </div>

        {/* Order Book */}
        <div className="orderbook-panel">
          <h3>Order Book</h3>
          <div className="orderbook">
            <div className="orderbook-header">
              <span>Price</span>
              <span>Amount</span>
              <span>Total</span>
            </div>
            
            <div className="asks">
              {orderBook.asks.slice(0, 10).map((ask, index) => (
                <div key={index} className="order-row ask">
                  <span className="price">{formatPrice(ask.price)}</span>
                  <span className="amount">{formatPrice(ask.amount)}</span>
                  <span className="total">{formatPrice(ask.price * ask.amount)}</span>
                </div>
              ))}
            </div>

            <div className="spread">
              <span className="spread-value">
                Spread: {formatPrice(Math.abs((orderBook.asks[0]?.price || 0) - (orderBook.bids[0]?.price || 0)))}
              </span>
            </div>

            <div className="bids">
              {orderBook.bids.slice(0, 10).map((bid, index) => (
                <div key={index} className="order-row bid">
                  <span className="price">{formatPrice(bid.price)}</span>
                  <span className="amount">{formatPrice(bid.amount)}</span>
                  <span className="total">{formatPrice(bid.price * bid.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="trades-panel">
          <h3>Recent Trades</h3>
          <div className="trades-list">
            <div className="trades-header">
              <span>Time</span>
              <span>Price</span>
              <span>Amount</span>
            </div>
            {recentTrades.map((trade, index) => (
              <div key={index} className={`trade-row ${trade.side}`}>
                <span className="time">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </span>
                <span className="price">{formatPrice(trade.price)}</span>
                <span className="amount">{formatPrice(trade.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Orders */}
        <div className="user-orders-panel">
          <h3>Your Orders</h3>
          <div className="orders-tabs">
            <button className="tab active">Open Orders</button>
            <button className="tab">Order History</button>
          </div>
          
          <div className="orders-list">
            {userOrders.length > 0 ? (
              userOrders.map((order) => (
                <div key={order._id} className="order-item">
                  <div className="order-info">
                    <span className={`side ${order.side}`}>{order.side.toUpperCase()}</span>
                    <span className="symbol">{order.symbol}</span>
                    <span className="type">{order.type}</span>
                  </div>
                  <div className="order-details">
                    <span>Price: {formatPrice(order.price)}</span>
                    <span>Amount: {formatPrice(order.amount)}</span>
                    <span>Filled: {formatPrice(order.filled || 0)}</span>
                  </div>
                  <div className="order-actions">
                    <span className={`status ${order.status}`}>{order.status}</span>
                    {order.status === 'open' && (
                      <button 
                        onClick={() => cancelOrder(order._id)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-orders">
                <p>No open orders</p>
                <span>Place your first order to start trading</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trading;