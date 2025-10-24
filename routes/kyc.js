const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { uploadKYCDocuments, uploadAvatar, handleUploadError, getFileUrl, deleteFile } = require('../middleware/upload');

// @route   POST /api/kyc/upload
// @desc    Upload KYC documents
// @access  Private
router.post('/upload', protect, (req, res, next) => {
  uploadKYCDocuments(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    next();
  });
}, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Process uploaded files
    const uploadedDocuments = [];
    
    if (req.files) {
      Object.keys(req.files).forEach(fieldName => {
        const files = req.files[fieldName];
        files.forEach(file => {
          uploadedDocuments.push({
            type: fieldName,
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            url: getFileUrl(file.path),
            size: file.size,
            uploadedAt: new Date()
          });
        });
      });
    }

    // Update user's KYC documents
    if (uploadedDocuments.length > 0) {
      user.kycDocuments = user.kycDocuments || [];
      user.kycDocuments.push(...uploadedDocuments.map(doc => doc.url));
      user.kycStatus = 'pending';
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'KYC documents uploaded successfully',
      documents: uploadedDocuments,
      kycStatus: user.kycStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/kyc/status
// @desc    Get KYC status and documents
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('kycStatus kycDocuments');
    
    res.status(200).json({
      success: true,
      kycStatus: user.kycStatus,
      documents: user.kycDocuments || [],
      canUpload: user.kycStatus === 'not_submitted' || user.kycStatus === 'rejected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/kyc/resubmit
// @desc    Resubmit KYC after rejection
// @access  Private
router.post('/resubmit', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.kycStatus !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'KYC can only be resubmitted after rejection'
      });
    }

    user.kycStatus = 'not_submitted';
    user.kycDocuments = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'KYC reset successfully. You can now upload new documents.',
      kycStatus: user.kycStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/kyc/avatar
// @desc    Upload profile avatar
// @access  Private
router.post('/avatar', protect, (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = user.avatar.replace('/uploads/', '');
      deleteFile(path.join(__dirname, '../uploads', oldAvatarPath));
    }

    // Update user avatar
    user.avatar = getFileUrl(req.file.path);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
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