# Chabad NF Campaign Backend API

A production-ready Express.js backend API server for the Chabad North Fulton campaign website (campexpansion.com).

## 🚀 Features

- **RESTful API** for campaign and dedication management
- **File-based storage** using JSON files for simplicity
- **CORS enabled** for cross-origin requests from campexpansion.com
- **Input validation** with express-validator
- **Rate limiting** to prevent abuse
- **Security headers** with helmet
- **Request logging** with morgan
- **Error handling** with proper HTTP status codes
- **Health check endpoint** for monitoring

## 📋 API Endpoints

### Campaign Management

#### GET /api/campaign-data
Get current campaign data.

**Response:**
```json
{
  "success": true,
  "data": {
    "goal": 1800000,
    "raised": 950000,
    "lastUpdated": "2025-01-31"
  }
}
```

#### POST /api/update-campaign
Update campaign goal and raised amounts.

**Request Body:**
```json
{
  "goal": 1800000,
  "raised": 950000,
  "lastUpdated": "2025-01-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign updated successfully",
  "data": {
    "goal": 1800000,
    "raised": 950000,
    "lastUpdated": "2025-01-31"
  }
}
```

### Dedication Management

#### GET /api/dedications
Get all dedications.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Campus Dedication",
      "amount": "$900,000",
      "status": "available",
      "phase": 1
    }
  ]
}
```

#### POST /api/update-dedication
Update a specific dedication.

**Request Body:**
```json
{
  "id": 1,
  "title": "Campus Dedication",
  "amount": "$900,000",
  "status": "sold",
  "phase": 1
}
```

#### POST /api/add-dedication
Add a new dedication.

**Request Body:**
```json
{
  "title": "New Dedication",
  "amount": "$100,000",
  "status": "available",
  "phase": 1
}
```

### Utility Endpoints

#### GET /api/health
Health check endpoint for monitoring.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-31T12:00:00.000Z"
}
```

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd chabadnf-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   Edit `.env` file with your configuration.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001` with automatic restart on file changes.

### Production Start
```bash
npm start
```

## 🌐 Deployment Options

### Option 1: Railway (Recommended)

1. **Create Railway account** at [railway.app](https://railway.app)
2. **Connect your GitHub repository**
3. **Deploy automatically** - Railway will detect the Node.js app
4. **Set environment variables** in Railway dashboard:
   - `PORT` (Railway sets this automatically)
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS=https://campexpansion.com`

### Option 2: Render

1. **Create Render account** at [render.com](https://render.com)
2. **Create new Web Service**
3. **Connect your GitHub repository**
4. **Configure build settings:**
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Set environment variables** in Render dashboard

### Option 3: Vercel

1. **Create Vercel account** at [vercel.com](https://vercel.com)
2. **Import your GitHub repository**
3. **Configure as Node.js project**
4. **Set environment variables** in Vercel dashboard

### Option 4: Heroku

1. **Create Heroku account** at [heroku.com](https://heroku.com)
2. **Install Heroku CLI**
3. **Deploy:**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```
4. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set ALLOWED_ORIGINS=https://campexpansion.com
   ```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://campexpansion.com,http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `NODE_ENV` | Environment | `production` |

## 📁 File Structure

```
chabadnf-backend/
├── package.json          # Dependencies and scripts
├── server.js             # Main server file
├── env.example           # Environment variables template
├── README.md             # This file
├── public/               # Data storage directory
│   ├── campaign-data.json    # Campaign data
│   └── dedications-data.json # Dedications data
└── .gitignore            # Git ignore file
```

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** protection with specific origins
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **Error handling** without exposing internals

## 🧪 Testing the API

### Using curl

1. **Health check:**
   ```bash
   curl https://your-backend-url.railway.app/api/health
   ```

2. **Get campaign data:**
   ```bash
   curl https://your-backend-url.railway.app/api/campaign-data
   ```

3. **Update campaign:**
   ```bash
   curl -X POST https://your-backend-url.railway.app/api/update-campaign \
     -H "Content-Type: application/json" \
     -d '{"goal": 1800000, "raised": 950000, "lastUpdated": "2025-01-31"}'
   ```

### Using Postman

1. Import the API endpoints into Postman
2. Set the base URL to your deployed backend
3. Test each endpoint with appropriate request bodies

## 🔄 Frontend Integration

After deploying your backend, update your React frontend's `AdminDashboard.js`:

```javascript
// Replace localhost:3001 with your deployed backend URL
const API_BASE_URL = 'https://your-backend-url.railway.app/api';

// Update your fetch calls
const response = await fetch(`${API_BASE_URL}/update-campaign`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(campaignData)
});
```

## 📊 Monitoring

- **Health check:** Monitor `/api/health` endpoint
- **Logs:** Check deployment platform logs
- **Uptime:** Use services like UptimeRobot for monitoring

## 🚨 Troubleshooting

### Common Issues

1. **CORS errors:** Ensure `ALLOWED_ORIGINS` includes your frontend domain
2. **Port issues:** Let the platform set the PORT automatically
3. **File permissions:** Ensure the `public` directory is writable
4. **Memory limits:** Some platforms have memory limits for file operations

### Debug Mode

For debugging, set `NODE_ENV=development` in your environment variables.

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check deployment platform logs
4. Contact the development team
