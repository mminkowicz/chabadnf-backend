const fetch = require('node-fetch');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing Chabad NF Backend API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);

    // Test get campaign data
    console.log('\n2. Testing get campaign data...');
    const campaignResponse = await fetch(`${BASE_URL}/api/campaign-data`);
    const campaignData = await campaignResponse.json();
    console.log('✅ Campaign data:', campaignData.data);

    // Test update campaign
    console.log('\n3. Testing update campaign...');
    const updateData = {
      goal: 2000000,
      raised: 1000000,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    const updateResponse = await fetch(`${BASE_URL}/api/update-campaign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    const updateResult = await updateResponse.json();
    console.log('✅ Campaign updated:', updateResult.message);

    // Test get dedications
    console.log('\n4. Testing get dedications...');
    const dedicationsResponse = await fetch(`${BASE_URL}/api/dedications`);
    const dedicationsData = await dedicationsResponse.json();
    console.log('✅ Dedications count:', dedicationsData.data.length);

    // Test add dedication
    console.log('\n5. Testing add dedication...');
    const newDedication = {
      title: 'Test Dedication',
      amount: '$50,000',
      status: 'available',
      phase: 1
    };
    const addResponse = await fetch(`${BASE_URL}/api/add-dedication`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDedication)
    });
    const addResult = await addResponse.json();
    console.log('✅ Dedication added:', addResult.message);

    // Test update dedication
    console.log('\n6. Testing update dedication...');
    const updateDedication = {
      id: 1,
      title: 'Updated Campus Dedication',
      amount: '$950,000',
      status: 'sold',
      phase: 1
    };
    const updateDedicationResponse = await fetch(`${BASE_URL}/api/update-dedication`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateDedication)
    });
    const updateDedicationResult = await updateDedicationResponse.json();
    console.log('✅ Dedication updated:', updateDedicationResult.message);

    console.log('\n🎉 All API tests passed successfully!');
    console.log(`📊 API is running at: ${BASE_URL}/api`);

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\nMake sure the server is running with: npm start');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
