const fetch = require('node-fetch');

// Replace this with your actual Railway URL
const RAILWAY_URL = process.env.RAILWAY_URL || 'https://your-app-name-production.up.railway.app';

async function testDeployedAPI() {
  console.log('🧪 Testing Deployed Chabad NF Backend API...\n');
  console.log(`📍 Testing URL: ${RAILWAY_URL}\n`);

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${RAILWAY_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);

    // Test get campaign data
    console.log('\n2. Testing get campaign data...');
    const campaignResponse = await fetch(`${RAILWAY_URL}/api/campaign-data`);
    const campaignData = await campaignResponse.json();
    console.log('✅ Campaign data:', campaignData.data);

    // Test get dedications
    console.log('\n3. Testing get dedications...');
    const dedicationsResponse = await fetch(`${RAILWAY_URL}/api/dedications`);
    const dedicationsData = await dedicationsResponse.json();
    console.log('✅ Dedications count:', dedicationsData.data.length);

    console.log('\n🎉 Deployed API is working perfectly!');
    console.log(`📊 Your backend is live at: ${RAILWAY_URL}/api`);
    console.log('\n📝 Next steps:');
    console.log('1. Update your frontend AdminDashboard.js to use this URL');
    console.log('2. Replace localhost:3001 with the Railway URL above');

  } catch (error) {
    console.error('❌ Deployed API test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure Railway deployment completed successfully');
    console.log('2. Check Railway logs for any errors');
    console.log('3. Verify the URL is correct');
  }
}

// Instructions for usage
console.log('📋 How to use this test script:');
console.log('1. Replace the RAILWAY_URL in this file with your actual Railway URL');
console.log('2. Or set the RAILWAY_URL environment variable');
console.log('3. Run: node test-deployed.js\n');

if (require.main === module) {
  testDeployedAPI();
}

module.exports = { testDeployedAPI };
