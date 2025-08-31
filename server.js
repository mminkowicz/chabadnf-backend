const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const fs = require('fs').promises;
const path = require('path');
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

// File paths
const CAMPAIGN_DATA_PATH = path.join(__dirname, 'public', 'campaign-data.json');
const DEDICATIONS_DATA_PATH = path.join(__dirname, 'public', 'dedications-data.json');

// Ensure public directory exists
async function ensurePublicDirectory() {
  try {
    await fs.mkdir(path.join(__dirname, 'public'), { recursive: true });
  } catch (error) {
    console.error('Error creating public directory:', error);
  }
}

// Initialize data files if they don't exist
async function initializeDataFiles() {
  try {
    // Initialize campaign data
    try {
      await fs.access(CAMPAIGN_DATA_PATH);
    } catch {
      const initialCampaignData = {
        goal: 1800000,
        raised: 950000,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      await fs.writeFile(CAMPAIGN_DATA_PATH, JSON.stringify(initialCampaignData, null, 2));
      console.log('Campaign data file initialized');
    }

    // Initialize dedications data
    try {
      await fs.access(DEDICATIONS_DATA_PATH);
    } catch {
      const initialDedicationsData = [
        { "id": 1, "title": "Campus Dedication", "amount": "$900,000", "status": "available", "phase": 1 },
        { "id": 7, "title": "Playground", "amount": "$300,000", "status": "available", "phase": 1 },
        { "id": 6, "title": "Soccer Field", "amount": "$300,000", "status": "sold", "phase": 1 }
      ];
      await fs.writeFile(DEDICATIONS_DATA_PATH, JSON.stringify(initialDedicationsData, null, 2));
      console.log('Dedications data file initialized');
    }
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}

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
    const data = await fs.readFile(CAMPAIGN_DATA_PATH, 'utf8');
    const campaignData = JSON.parse(data);
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
      goal: Number(goal),
      raised: Number(raised),
      lastUpdated: lastUpdated
    };

    await fs.writeFile(CAMPAIGN_DATA_PATH, JSON.stringify(campaignData, null, 2));
    
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
    const data = await fs.readFile(DEDICATIONS_DATA_PATH, 'utf8');
    const dedications = JSON.parse(data);
    res.json({
      success: true,
      data: dedications
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

    const data = await fs.readFile(DEDICATIONS_DATA_PATH, 'utf8');
    const dedications = JSON.parse(data);
    
    const dedicationIndex = dedications.findIndex(d => d.id === Number(id));
    if (dedicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Dedication not found'
      });
    }

    dedications[dedicationIndex] = {
      ...dedications[dedicationIndex],
      title: title.trim(),
      amount: amount.trim(),
      status,
      phase: phase || dedications[dedicationIndex].phase || 1
    };

    await fs.writeFile(DEDICATIONS_DATA_PATH, JSON.stringify(dedications, null, 2));
    
    res.json({
      success: true,
      message: 'Dedication updated successfully',
      data: dedications[dedicationIndex]
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
    
    const data = await fs.readFile(DEDICATIONS_DATA_PATH, 'utf8');
    const dedications = JSON.parse(data);
    
    // Generate new ID
    const newId = Math.max(...dedications.map(d => d.id), 0) + 1;
    
    const newDedication = {
      id: newId,
      title: title.trim(),
      amount: amount.trim(),
      status,
      phase: phase || 1
    };

    dedications.push(newDedication);
    await fs.writeFile(DEDICATIONS_DATA_PATH, JSON.stringify(dedications, null, 2));
    
    res.status(201).json({
      success: true,
      message: 'Dedication added successfully',
      data: newDedication
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
  await ensurePublicDirectory();
  await initializeDataFiles();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch(console.error);
