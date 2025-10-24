import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService, walletService } from '../services';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, walletResponse] = await Promise.all([
        userService.getStats(),
        walletService.getWallet(),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

      if (walletResponse.success) {
        setWallet(walletResponse.wallet);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600">Crypto Trading Platform Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                KYC Status: 
                <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                  user?.kycStatus === 'approved' 
                    ? 'bg-green-100 text-green-800'
                    : user?.kycStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user?.kycStatus?.replace('_', ' ').toUpperCase()}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Portfolio Value */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">$</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Portfolio Value
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${stats?.totalValue || '0.00'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Transactions */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">T</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Transactions
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.totalTransactions || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Mining */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">M</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Mining
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.activeMining || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Trades */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">₿</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Trades
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.totalTrades || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Balances */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Wallet Balances
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Your current cryptocurrency balances
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                {wallet?.balances?.map((balance, index) => (
                  <div
                    key={balance.currency}
                    className={`${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}
                  >
                    <dt className="text-sm font-medium text-gray-500">
                      {balance.currency}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <div className="flex justify-between">
                        <span>Available: {balance.available}</span>
                        <span>Locked: {balance.locked}</span>
                        <span className="font-semibold">Total: {balance.total}</span>
                      </div>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                  Deposit
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                  Trade
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700">
                  Mining
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700">
                  P2P Trade
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;