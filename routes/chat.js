const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getActiveChatConfig } = require('../utils/liveChatConfig');

// @route   GET /api/chat/config
// @desc    Get live chat configuration
// @access  Public
router.get('/config', (req, res) => {
  try {
    const chatConfig = getActiveChatConfig();

    if (!chatConfig) {
      return res.status(200).json({
        success: true,
        enabled: false,
        message: 'Live chat is not configured'
      });
    }

    res.status(200).json({
      success: true,
      enabled: true,
      provider: chatConfig.name,
      script: chatConfig.script,
      widget: chatConfig.widget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/chat/status
// @desc    Get chat availability status
// @access  Public
router.get('/status', (req, res) => {
  try {
    const chatConfig = getActiveChatConfig();
    const isAvailable = chatConfig !== null;

    res.status(200).json({
      success: true,
      available: isAvailable,
      provider: chatConfig ? chatConfig.name : null,
      message: isAvailable 
        ? 'Live chat is available' 
        : 'Live chat is currently unavailable'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
