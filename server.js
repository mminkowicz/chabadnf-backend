const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const { db } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration for campexpansion.com
app.use(cors({
  origin: ['https://campexpansion.com', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database storage for persistent data across all serverless instances

// Validation middleware
const validateCampaignUpdate = [
  body('goal').isNumeric().withMessage('Goal must be a number'),
  body('raised').isNumeric().withMessage('Raised amount must be a number'),
  body('lastUpdated').isISO8601().withMessage('Last updated must be a valid date')
];

const validateDedication = [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('amount').trim().isLength({ min: 1 }).withMessage('Amount is required'),
  body('status').isIn(['available', 'sold', 'pending']).withMessage('Status must be available, sold, or pending'),
  body('phase').optional().isInt({ min: 1 }).withMessage('Phase must be a positive integer')
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// API Routes

// GET /api/campaign-data
app.get('/api/campaign-data', async (req, res) => {
  try {
    const campaignData = await db.getCampaignData();
    res.json({
      success: true,
      data: campaignData
    });
  } catch (error) {
    console.error('Error reading campaign data:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving campaign data'
    });
  }
});

// POST /api/update-campaign
app.post('/api/update-campaign', validateCampaignUpdate, handleValidationErrors, async (req, res) => {
  try {
    const { goal, raised, lastUpdated } = req.body;
    
    const campaignData = {
      id: 1, // Single record for campaign data
      goal: Number(goal),
      raised: Number(raised),
      lastUpdated: lastUpdated
    };
    
    await db.updateCampaignData(campaignData);
    
    res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: campaignData
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating campaign. Please try again.'
    });
  }
});

// GET /api/dedications
app.get('/api/dedications', async (req, res) => {
  try {
    const dedicationsData = await db.getDedications();
    res.json({
      success: true,
      data: dedicationsData
    });
  } catch (error) {
    console.error('Error reading dedications:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dedications'
    });
  }
});

// POST /api/update-dedication
app.post('/api/update-dedication', validateDedication, handleValidationErrors, async (req, res) => {
  try {
    const { id, title, amount, status, phase } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Dedication ID is required'
      });
    }

    const dedication = {
      id: Number(id),
      title: title.trim(),
      amount: amount.trim(),
      status,
      phase: phase || 1
    };

    await db.updateDedication(dedication);
    
    res.json({
      success: true,
      message: 'Dedication updated successfully',
      data: dedication
    });
  } catch (error) {
    console.error('Error updating dedication:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating dedication. Please try again.'
    });
  }
});

// POST /api/add-dedication
app.post('/api/add-dedication', validateDedication, handleValidationErrors, async (req, res) => {
  try {
    const { title, amount, status, phase } = req.body;
    
    const newDedication = {
      title: title.trim(),
      amount: amount.trim(),
      status,
      phase: phase || 1
    };

    const result = await db.addDedication(newDedication);
    
    res.status(201).json({
      success: true,
      message: 'Dedication added successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Error adding dedication:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding dedication. Please try again.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Initialize and start server
async function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch(console.error);
