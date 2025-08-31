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
  origin: true, // Allow all origins temporarily
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

// File paths for persistent storage
const DATA_DIR = path.join(__dirname, 'data');
const CAMPAIGN_FILE = path.join(DATA_DIR, 'campaign.json');
const DEDICATIONS_FILE = path.join(DATA_DIR, 'dedications.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.log('Data directory already exists or cannot be created');
  }
}

// Load data from file or use defaults
async function loadCampaignData() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(CAMPAIGN_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return default data if file doesn't exist
    return {
      goal: 1800000,
      raised: 950000,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  }
}

async function loadDedicationsData() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DEDICATIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return default dedications if file doesn't exist
    return [
      { "id": 1, "title": "Campus Dedication", "amount": "$900,000", "status": "available", "phase": 1 },
      { "id": 7, "title": "Playground", "amount": "$300,000", "status": "available", "phase": 1 },
      { "id": 6, "title": "Soccer Field", "amount": "$300,000", "status": "sold", "phase": 1 },
      { "id": 3, "title": "Basketball Court", "amount": "$250,000", "status": "available", "phase": 1 },
      { "id": 2, "title": "Baseball Field", "amount": "$200,000", "status": "available", "phase": 1 },
      { "id": 4, "title": "Pickleball Court", "amount": "$180,000", "status": "available", "phase": 1 },
      { "id": 5, "title": "Kids Car Track", "amount": "$100,000", "status": "sold", "phase": 1 },
      { "id": 8, "title": "Nature Trail", "amount": "$100,000", "status": "available", "phase": 1 },
      { "id": 9, "title": "Nature Nest", "amount": "$75,000", "status": "available", "phase": 1 },
      { "id": 10, "title": "Water Slides", "amount": "$25,000", "status": "available", "phase": 1 },
      { "id": 11, "title": "Gazebos", "amount": "$25,000", "status": "available", "phase": 1 },
      { "id": 12, "title": "Bleachers", "amount": "$5,000", "status": "available", "phase": 1 },
      { "id": 13, "title": "Benches", "amount": "$3,600", "status": "available", "phase": 1 },
      { "id": 14, "title": "Retreat House", "amount": "$850,000", "status": "available", "phase": 2 },
      { "id": 15, "title": "Gym", "amount": "$4,000,000", "status": "available", "phase": 2 }
    ];
  }
}

// Save data to file
async function saveCampaignData(data) {
  try {
    await ensureDataDir();
    await fs.writeFile(CAMPAIGN_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving campaign data:', error);
  }
}

async function saveDedicationsData(data) {
  try {
    await ensureDataDir();
    await fs.writeFile(DEDICATIONS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving dedications data:', error);
  }
}

// Database operations with persistent storage
const db = {
  async getCampaignData() {
    return await loadCampaignData();
  },
  async updateCampaignData(data) {
    await saveCampaignData(data);
    return data;
  },
  async getDedications() {
    return await loadDedicationsData();
  },
  async updateDedication(dedication) {
    const dedications = await loadDedicationsData();
    const index = dedications.findIndex(d => d.id === dedication.id);
    if (index !== -1) {
      dedications[index] = dedication;
    }
    await saveDedicationsData(dedications);
    return dedication;
  },
  async addDedication(dedication) {
    const dedications = await loadDedicationsData();
    const newId = Math.max(...dedications.map(d => d.id), 0) + 1;
    const newDedication = { ...dedication, id: newId };
    dedications.push(newDedication);
    await saveDedicationsData(dedications);
    return [newDedication];
  }
};

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
    
    console.log('Updating campaign with data:', { goal, raised, lastUpdated });
    
    const campaignData = {
      id: 1, // Single record for campaign data
      goal: Number(goal),
      raised: Number(raised),
      lastUpdated: lastUpdated
    };
    
    const result = await db.updateCampaignData(campaignData);
    console.log('Update result:', result);
    
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
    timestamp: new Date().toISOString(),
    storage: 'persistent'
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
