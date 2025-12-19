import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './KYC.css';

const KYC = () => {
  const { user } = useAuth();
  const [kycStatus, setKycStatus] = useState('not_started');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    // Identity Verification
    idType: 'passport',
    idNumber: '',
    idExpiryDate: '',
    // Documents
    frontIdDocument: null,
    backIdDocument: null,
    selfieDocument: null,
    proofOfAddress: null,
    // Financial Information
    sourceOfFunds: '',
    estimatedTradingVolume: '',
    occupation: '',
    employer: '',
    // Agreement
    termsAccepted: false,
    dataProcessingAccepted: false
  });
  const [uploadProgress, setUploadProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: 'Personal Information', icon: '👤' },
    { id: 2, title: 'Identity Verification', icon: '🆔' },
    { id: 3, title: 'Document Upload', icon: '📄' },
    { id: 4, title: 'Financial Information', icon: '💼' },
    { id: 5, title: 'Review & Submit', icon: '✅' }
  ];

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Germany', 'France',
    'Australia', 'Japan', 'South Korea', 'Singapore', 'Netherlands',
    'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland'
  ];

  const idTypes = [
    { value: 'passport', label: 'Passport' },
    { value: 'drivers_license', label: 'Driver\'s License' },
    { value: 'national_id', label: 'National ID Card' }
  ];

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/kyc-status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setKycStatus(data.data?.status || 'not_started');
        if (data.data?.formData) {
          setFormData(prev => ({ ...prev, ...data.data.formData }));
        }
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileUpload = async (field, file) => {
    if (!file) return;

    // Validate file
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setErrors(prev => ({ ...prev, [field]: 'File size must be less than 10MB' }));
      return;
    }

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, [field]: 'Please upload an image or PDF file' }));
      return;
    }

    setUploadProgress(prev => ({ ...prev, [field]: 0 }));

    const formDataUpload = new FormData();
    formDataUpload.append('document', file);
    formDataUpload.append('type', field);

    try {
      const response = await fetch('http://localhost:5000/api/users/upload-kyc-document', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, [field]: data.data.filePath }));
        setUploadProgress(prev => ({ ...prev, [field]: 100 }));
      } else {
        setErrors(prev => ({ ...prev, [field]: 'Upload failed. Please try again.' }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({ ...prev, [field]: 'Upload failed. Please try again.' }));
    } finally {
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [field]: null }));
      }, 2000);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.nationality) newErrors.nationality = 'Nationality is required';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.address.street) newErrors['address.street'] = 'Street address is required';
        if (!formData.address.city) newErrors['address.city'] = 'City is required';
        if (!formData.address.country) newErrors['address.country'] = 'Country is required';
        break;
      
      case 2:
        if (!formData.idType) newErrors.idType = 'ID type is required';
        if (!formData.idNumber) newErrors.idNumber = 'ID number is required';
        if (!formData.idExpiryDate) newErrors.idExpiryDate = 'ID expiry date is required';
        break;
      
      case 3:
        if (!formData.frontIdDocument) newErrors.frontIdDocument = 'Front ID document is required';
        if (formData.idType === 'drivers_license' && !formData.backIdDocument) {
          newErrors.backIdDocument = 'Back ID document is required';
        }
        if (!formData.selfieDocument) newErrors.selfieDocument = 'Selfie document is required';
        if (!formData.proofOfAddress) newErrors.proofOfAddress = 'Proof of address is required';
        break;
      
      case 4:
        if (!formData.sourceOfFunds) newErrors.sourceOfFunds = 'Source of funds is required';
        if (!formData.estimatedTradingVolume) newErrors.estimatedTradingVolume = 'Estimated trading volume is required';
        if (!formData.occupation) newErrors.occupation = 'Occupation is required';
        break;
      
      case 5:
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
        if (!formData.dataProcessingAccepted) newErrors.dataProcessingAccepted = 'You must accept data processing terms';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitKYC = async () => {
    if (!validateStep(5)) return;

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/submit-kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setKycStatus('pending');
        alert('KYC application submitted successfully! We will review your application within 1-3 business days.');
      } else {
        const data = await response.json();
        alert(data.message || 'Error submitting KYC application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting KYC:', error);
      alert('Error submitting KYC application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = () => {
    const statusConfig = {
      not_started: { color: '#a0aec0', text: 'Not Started', icon: '⏳' },
      pending: { color: '#ed8936', text: 'Under Review', icon: '⏰' },
      approved: { color: '#48bb78', text: 'Verified', icon: '✅' },
      rejected: { color: '#f56565', text: 'Rejected', icon: '❌' },
      incomplete: { color: '#9f7aea', text: 'Incomplete', icon: '📝' }
    };

    const config = statusConfig[kycStatus];
    return (
      <div className="status-badge" style={{ color: config.color }}>
        <span className="status-icon">{config.icon}</span>
        <span className="status-text">{config.text}</span>
      </div>
    );
  };

  if (kycStatus === 'approved') {
    return (
      <div className="kyc-page">
        <div className="kyc-header">
          <h1>KYC Verification</h1>
          {renderStatusBadge()}
        </div>
        <div className="kyc-approved">
          <div className="success-icon">✅</div>
          <h2>Verification Complete</h2>
          <p>Your identity has been successfully verified. You now have full access to all platform features.</p>
          <div className="verification-details">
            <div className="detail-item">
              <span className="detail-label">Verification Level:</span>
              <span className="detail-value">Level 2 - Full Verification</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Trading Limits:</span>
              <span className="detail-value">No Limits</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Withdrawal Limits:</span>
              <span className="detail-value">$100,000 per day</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (kycStatus === 'pending') {
    return (
      <div className="kyc-page">
        <div className="kyc-header">
          <h1>KYC Verification</h1>
          {renderStatusBadge()}
        </div>
        <div className="kyc-pending">
          <div className="pending-icon">⏰</div>
          <h2>Under Review</h2>
          <p>Thank you for submitting your KYC application. Our team is currently reviewing your documents.</p>
          <div className="review-timeline">
            <div className="timeline-item completed">
              <div className="timeline-icon">✅</div>
              <div className="timeline-content">
                <h4>Application Submitted</h4>
                <p>Your KYC application has been received</p>
              </div>
            </div>
            <div className="timeline-item active">
              <div className="timeline-icon">⏰</div>
              <div className="timeline-content">
                <h4>Under Review</h4>
                <p>Our team is verifying your documents</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon">📧</div>
              <div className="timeline-content">
                <h4>Decision Notification</h4>
                <p>You'll receive an email with the verification result</p>
              </div>
            </div>
          </div>
          <p className="review-note">
            <strong>Review Time:</strong> 1-3 business days<br />
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="kyc-page">
      <div className="kyc-header">
        <h1>KYC Verification</h1>
        {renderStatusBadge()}
      </div>

      <div className="kyc-description">
        <p>Complete your Know Your Customer (KYC) verification to unlock full platform features including higher trading and withdrawal limits.</p>
      </div>

      {/* Step Progress */}
      <div className="step-progress">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`step-item ${currentStep >= step.id ? 'completed' : ''} ${currentStep === step.id ? 'active' : ''}`}
          >
            <div className="step-icon">{step.icon}</div>
            <div className="step-info">
              <span className="step-number">Step {step.id}</span>
              <span className="step-title">{step.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="kyc-form">
        {currentStep === 1 && (
          <div className="form-step">
            <h2>Personal Information</h2>
            <p>Please provide your personal details as they appear on your official documents.</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>

              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={errors.dateOfBirth ? 'error' : ''}
                />
                {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
              </div>

              <div className="form-group">
                <label>Nationality *</label>
                <select
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className={errors.nationality ? 'error' : ''}
                >
                  <option value="">Select Nationality</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {errors.nationality && <span className="error-message">{errors.nationality}</span>}
              </div>

              <div className="form-group full-width">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className={errors.phoneNumber ? 'error' : ''}
                />
                {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
              </div>
            </div>

            <h3>Address Information</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Street Address *</label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  className={errors['address.street'] ? 'error' : ''}
                />
                {errors['address.street'] && <span className="error-message">{errors['address.street']}</span>}
              </div>

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  className={errors['address.city'] ? 'error' : ''}
                />
                {errors['address.city'] && <span className="error-message">{errors['address.city']}</span>}
              </div>

              <div className="form-group">
                <label>State/Province</label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>ZIP/Postal Code</label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Country *</label>
                <select
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                  className={errors['address.country'] ? 'error' : ''}
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {errors['address.country'] && <span className="error-message">{errors['address.country']}</span>}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-step">
            <h2>Identity Verification</h2>
            <p>Provide details from your government-issued identification document.</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>ID Document Type *</label>
                <select
                  value={formData.idType}
                  onChange={(e) => handleInputChange('idType', e.target.value)}
                  className={errors.idType ? 'error' : ''}
                >
                  {idTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.idType && <span className="error-message">{errors.idType}</span>}
              </div>

              <div className="form-group">
                <label>ID Number *</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                  className={errors.idNumber ? 'error' : ''}
                />
                {errors.idNumber && <span className="error-message">{errors.idNumber}</span>}
              </div>

              <div className="form-group">
                <label>ID Expiry Date *</label>
                <input
                  type="date"
                  value={formData.idExpiryDate}
                  onChange={(e) => handleInputChange('idExpiryDate', e.target.value)}
                  className={errors.idExpiryDate ? 'error' : ''}
                />
                {errors.idExpiryDate && <span className="error-message">{errors.idExpiryDate}</span>}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-step">
            <h2>Document Upload</h2>
            <p>Upload clear photos or scans of your identification documents. Files must be in JPG, PNG, or PDF format and under 10MB.</p>
            
            <div className="upload-grid">
              <div className="upload-section">
                <h3>Front of ID Document *</h3>
                <div className="upload-area">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload('frontIdDocument', e.target.files[0])}
                    className="upload-input"
                    id="frontIdDocument"
                  />
                  <label htmlFor="frontIdDocument" className="upload-label">
                    {formData.frontIdDocument ? '✅ Uploaded' : '📄 Click to upload'}
                  </label>
                  {uploadProgress.frontIdDocument !== null && (
                    <div className="upload-progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${uploadProgress.frontIdDocument}%` }}
                      ></div>
                    </div>
                  )}
                  {errors.frontIdDocument && <span className="error-message">{errors.frontIdDocument}</span>}
                </div>
              </div>

              {formData.idType === 'drivers_license' && (
                <div className="upload-section">
                  <h3>Back of ID Document *</h3>
                  <div className="upload-area">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('backIdDocument', e.target.files[0])}
                      className="upload-input"
                      id="backIdDocument"
                    />
                    <label htmlFor="backIdDocument" className="upload-label">
                      {formData.backIdDocument ? '✅ Uploaded' : '📄 Click to upload'}
                    </label>
                    {uploadProgress.backIdDocument !== null && (
                      <div className="upload-progress">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${uploadProgress.backIdDocument}%` }}
                        ></div>
                      </div>
                    )}
                    {errors.backIdDocument && <span className="error-message">{errors.backIdDocument}</span>}
                  </div>
                </div>
              )}

              <div className="upload-section">
                <h3>Selfie with ID *</h3>
                <p className="upload-hint">Take a selfie holding your ID document next to your face</p>
                <div className="upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('selfieDocument', e.target.files[0])}
                    className="upload-input"
                    id="selfieDocument"
                  />
                  <label htmlFor="selfieDocument" className="upload-label">
                    {formData.selfieDocument ? '✅ Uploaded' : '🤳 Click to upload'}
                  </label>
                  {uploadProgress.selfieDocument !== null && (
                    <div className="upload-progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${uploadProgress.selfieDocument}%` }}
                      ></div>
                    </div>
                  )}
                  {errors.selfieDocument && <span className="error-message">{errors.selfieDocument}</span>}
                </div>
              </div>

              <div className="upload-section">
                <h3>Proof of Address *</h3>
                <p className="upload-hint">Bank statement, utility bill, or official letter (less than 3 months old)</p>
                <div className="upload-area">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload('proofOfAddress', e.target.files[0])}
                    className="upload-input"
                    id="proofOfAddress"
                  />
                  <label htmlFor="proofOfAddress" className="upload-label">
                    {formData.proofOfAddress ? '✅ Uploaded' : '🏠 Click to upload'}
                  </label>
                  {uploadProgress.proofOfAddress !== null && (
                    <div className="upload-progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${uploadProgress.proofOfAddress}%` }}
                      ></div>
                    </div>
                  )}
                  {errors.proofOfAddress && <span className="error-message">{errors.proofOfAddress}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="form-step">
            <h2>Financial Information</h2>
            <p>Help us understand your financial background for compliance purposes.</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Source of Funds *</label>
                <select
                  value={formData.sourceOfFunds}
                  onChange={(e) => handleInputChange('sourceOfFunds', e.target.value)}
                  className={errors.sourceOfFunds ? 'error' : ''}
                >
                  <option value="">Select Source</option>
                  <option value="employment">Employment/Salary</option>
                  <option value="business">Business Ownership</option>
                  <option value="investments">Investments</option>
                  <option value="inheritance">Inheritance</option>
                  <option value="savings">Personal Savings</option>
                  <option value="other">Other</option>
                </select>
                {errors.sourceOfFunds && <span className="error-message">{errors.sourceOfFunds}</span>}
              </div>

              <div className="form-group">
                <label>Estimated Trading Volume (Monthly) *</label>
                <select
                  value={formData.estimatedTradingVolume}
                  onChange={(e) => handleInputChange('estimatedTradingVolume', e.target.value)}
                  className={errors.estimatedTradingVolume ? 'error' : ''}
                >
                  <option value="">Select Range</option>
                  <option value="0-1000">$0 - $1,000</option>
                  <option value="1000-10000">$1,000 - $10,000</option>
                  <option value="10000-50000">$10,000 - $50,000</option>
                  <option value="50000-100000">$50,000 - $100,000</option>
                  <option value="100000+">$100,000+</option>
                </select>
                {errors.estimatedTradingVolume && <span className="error-message">{errors.estimatedTradingVolume}</span>}
              </div>

              <div className="form-group">
                <label>Occupation *</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className={errors.occupation ? 'error' : ''}
                />
                {errors.occupation && <span className="error-message">{errors.occupation}</span>}
              </div>

              <div className="form-group">
                <label>Employer (Optional)</label>
                <input
                  type="text"
                  value={formData.employer}
                  onChange={(e) => handleInputChange('employer', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="form-step">
            <h2>Review & Submit</h2>
            <p>Please review your information and agree to our terms before submitting.</p>
            
            <div className="review-sections">
              <div className="review-section">
                <h3>Personal Information</h3>
                <div className="review-item">
                  <span>Name:</span>
                  <span>{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="review-item">
                  <span>Date of Birth:</span>
                  <span>{formData.dateOfBirth}</span>
                </div>
                <div className="review-item">
                  <span>Nationality:</span>
                  <span>{formData.nationality}</span>
                </div>
              </div>

              <div className="review-section">
                <h3>Identity Documents</h3>
                <div className="review-item">
                  <span>ID Type:</span>
                  <span>{idTypes.find(t => t.value === formData.idType)?.label}</span>
                </div>
                <div className="review-item">
                  <span>Documents:</span>
                  <span>
                    {formData.frontIdDocument && '✅ Front ID '}
                    {formData.backIdDocument && '✅ Back ID '}
                    {formData.selfieDocument && '✅ Selfie '}
                    {formData.proofOfAddress && '✅ Address Proof'}
                  </span>
                </div>
              </div>
            </div>

            <div className="agreement-section">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                  />
                  <span>I agree to the <a href="#" target="_blank">Terms and Conditions</a> *</span>
                </label>
                {errors.termsAccepted && <span className="error-message">{errors.termsAccepted}</span>}
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.dataProcessingAccepted}
                    onChange={(e) => handleInputChange('dataProcessingAccepted', e.target.checked)}
                  />
                  <span>I consent to the processing of my personal data for KYC purposes *</span>
                </label>
                {errors.dataProcessingAccepted && <span className="error-message">{errors.dataProcessingAccepted}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button className="btn-secondary" onClick={prevStep}>
              Previous
            </button>
          )}
          
          <div className="nav-spacer"></div>
          
          {currentStep < 5 ? (
            <button className="btn-primary" onClick={nextStep}>
              Next Step
            </button>
          ) : (
            <button 
              className="btn-primary submit-btn" 
              onClick={submitKYC}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit KYC Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYC;