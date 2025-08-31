const fetch = require('node-fetch');

// Replace this with your actual Vercel URL
const VERCEL_URL = process.env.VERCEL_URL || 'https://your-app-name.vercel.app';

async function testVercelAPI() {
  console.log('🧪 Testing Vercel Deployed Chabad NF Backend API...\n');
  console.log(`📍 Testing URL: ${VERCEL_URL}\n`);

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${VERCEL_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);

    // Test get campaign data
    console.log('\n2. Testing get campaign data...');
    const campaignResponse = await fetch(`${VERCEL_URL}/api/campaign-data`);
    const campaignData = await campaignResponse.json();
    console.log('✅ Campaign data:', campaignData.data);

    // Test get dedications
    console.log('\n3. Testing get dedications...');
    const dedicationsResponse = await fetch(`${VERCEL_URL}/api/dedications`);
    const dedicationsData = await dedicationsResponse.json();
    console.log('✅ Dedications count:', dedicationsData.data.length);

    console.log('\n🎉 Vercel API is working perfectly!');
    console.log(`📊 Your backend is live at: ${VERCEL_URL}/api`);
    console.log('\n📝 Next steps:');
    console.log('1. Update your frontend AdminDashboard.js to use this URL');
    console.log('2. Replace localhost:3001 with the Vercel URL above');

  } catch (error) {
    console.error('❌ Vercel API test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure Vercel deployment completed successfully');
    console.log('2. Check Vercel logs for any errors');
    console.log('3. Verify the URL is correct');
    console.log('4. Check Vercel dashboard for deployment status');
  }
}

// Instructions for usage
console.log('📋 How to use this test script:');
console.log('1. Replace the VERCEL_URL in this file with your actual Vercel URL');
console.log('2. Or set the VERCEL_URL environment variable');
console.log('3. Run: node test-vercel.js\n');

if (require.main === module) {
  testVercelAPI();
}

module.exports = { testVercelAPI };
