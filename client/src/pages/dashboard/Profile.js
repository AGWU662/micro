import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    dateOfBirth: '',
    bio: ''
  });
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    tradeAlerts: true,
    marketUpdates: true,
    securityAlerts: true,
    maintenanceUpdates: false
  });
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        city: user.city || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        bio: user.bio || ''
      });
      
      setSecurityData(prev => ({
        ...prev,
        twoFactorEnabled: user.twoFactorEnabled || false
      }));
      
      if (user.avatar) {
        setAvatarPreview(`http://localhost:5000${user.avatar}`);
      }
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        formData.append(key, profileData[key]);
      });

      if (avatar) {
        formData.append('avatar', avatar);
      }

      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data.data.user);
        alert('Profile updated successfully!');
      } else {
        alert('Error updating profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword
        })
      });

      if (response.ok) {
        setSecurityData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          twoFactorEnabled: securityData.twoFactorEnabled
        });
        alert('Password changed successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Error changing password. Please try again.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(notificationSettings)
      });

      if (response.ok) {
        alert('Notification settings updated successfully!');
      } else {
        alert('Error updating notification settings. Please try again.');
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
      alert('Error updating notification settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const toggle2FA = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/toggle-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ enabled: !securityData.twoFactorEnabled })
      });

      if (response.ok) {
        setSecurityData(prev => ({
          ...prev,
          twoFactorEnabled: !prev.twoFactorEnabled
        }));
        alert(`Two-factor authentication ${!securityData.twoFactorEnabled ? 'enabled' : 'disabled'} successfully!`);
      } else {
        alert('Error updating 2FA settings. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      alert('Error updating 2FA settings. Please try again.');
    }
  };

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Germany', 'France',
    'Australia', 'Japan', 'South Korea', 'Singapore', 'Netherlands',
    'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland'
  ];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Account Settings</h1>
        <p>Manage your account information and preferences</p>
      </div>

      {/* Profile Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔒 Security
        </button>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications
        </button>
        <button
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          📊 Activity
        </button>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Profile Information</h2>
              <p>Update your account details and personal information</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="profile-form">
              {/* Avatar Upload */}
              <div className="avatar-section">
                <div className="avatar-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="avatar-image" />
                  ) : (
                    <div className="avatar-placeholder">
                      <span>👤</span>
                    </div>
                  )}
                </div>
                <div className="avatar-upload">
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="avatar-input"
                  />
                  <label htmlFor="avatar" className="avatar-upload-btn">
                    Change Avatar
                  </label>
                  <p className="avatar-hint">JPG, PNG or GIF. Max size 5MB.</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <select
                    value={profileData.country}
                    onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  rows="4"
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security-section">
            <div className="section-header">
              <h2>Security Settings</h2>
              <p>Manage your account security and authentication</p>
            </div>

            {/* Change Password */}
            <div className="security-card">
              <h3>Change Password</h3>
              <form onSubmit={handleSecuritySubmit}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                    required
                    minLength="6"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                    required
                    minLength="6"
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>

            {/* Two-Factor Authentication */}
            <div className="security-card">
              <div className="security-option">
                <div className="option-info">
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <div className="option-toggle">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={securityData.twoFactorEnabled}
                      onChange={toggle2FA}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Login History */}
            <div className="security-card">
              <h3>Recent Login Activity</h3>
              <div className="login-history">
                <div className="login-item">
                  <div className="login-info">
                    <span className="login-location">🌍 New York, US</span>
                    <span className="login-device">💻 Chrome on Windows</span>
                  </div>
                  <div className="login-time">
                    <span className="current-session">Current Session</span>
                    <span>2 hours ago</span>
                  </div>
                </div>
                <div className="login-item">
                  <div className="login-info">
                    <span className="login-location">🌍 London, UK</span>
                    <span className="login-device">📱 Mobile App</span>
                  </div>
                  <div className="login-time">
                    <span>Yesterday 3:45 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-section">
            <div className="section-header">
              <h2>Notification Preferences</h2>
              <p>Choose what notifications you want to receive</p>
            </div>

            <form onSubmit={handleNotificationSubmit}>
              <div className="notification-categories">
                <div className="notification-card">
                  <h3>Communication</h3>
                  <div className="notification-options">
                    <div className="notification-option">
                      <label className="option-label">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            emailNotifications: e.target.checked
                          })}
                        />
                        <span>Email Notifications</span>
                      </label>
                      <p>Receive notifications via email</p>
                    </div>

                    <div className="notification-option">
                      <label className="option-label">
                        <input
                          type="checkbox"
                          checked={notificationSettings.smsNotifications}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            smsNotifications: e.target.checked
                          })}
                        />
                        <span>SMS Notifications</span>
                      </label>
                      <p>Receive notifications via SMS</p>
                    </div>
                  </div>
                </div>

                <div className="notification-card">
                  <h3>Trading & Markets</h3>
                  <div className="notification-options">
                    <div className="notification-option">
                      <label className="option-label">
                        <input
                          type="checkbox"
                          checked={notificationSettings.tradeAlerts}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            tradeAlerts: e.target.checked
                          })}
                        />
                        <span>Trade Alerts</span>
                      </label>
                      <p>Get notified about your trade executions</p>
                    </div>

                    <div className="notification-option">
                      <label className="option-label">
                        <input
                          type="checkbox"
                          checked={notificationSettings.marketUpdates}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            marketUpdates: e.target.checked
                          })}
                        />
                        <span>Market Updates</span>
                      </label>
                      <p>Receive market news and price alerts</p>
                    </div>
                  </div>
                </div>

                <div className="notification-card">
                  <h3>Security & System</h3>
                  <div className="notification-options">
                    <div className="notification-option">
                      <label className="option-label">
                        <input
                          type="checkbox"
                          checked={notificationSettings.securityAlerts}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            securityAlerts: e.target.checked
                          })}
                        />
                        <span>Security Alerts</span>
                      </label>
                      <p>Important security-related notifications</p>
                    </div>

                    <div className="notification-option">
                      <label className="option-label">
                        <input
                          type="checkbox"
                          checked={notificationSettings.maintenanceUpdates}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            maintenanceUpdates: e.target.checked
                          })}
                        />
                        <span>Maintenance Updates</span>
                      </label>
                      <p>System maintenance and downtime notifications</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-section">
            <div className="section-header">
              <h2>Account Activity</h2>
              <p>View your recent account activities and statistics</p>
            </div>

            <div className="activity-stats">
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-info">
                  <h3>Total Trades</h3>
                  <p className="stat-value">0</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>Total Volume</h3>
                  <p className="stat-value">$0.00</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⛏️</div>
                <div className="stat-info">
                  <h3>Mining Rewards</h3>
                  <p className="stat-value">$0.00</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-info">
                  <h3>Account Level</h3>
                  <p className="stat-value">Beginner</p>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">👤</div>
                  <div className="activity-info">
                    <span className="activity-title">Account Created</span>
                    <span className="activity-time">Just now</span>
                  </div>
                </div>
                <div className="empty-activity">
                  <p>No recent activities to show</p>
                  <span>Start trading to see your activity history</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;