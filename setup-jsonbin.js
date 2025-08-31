const fetch = require('node-fetch');

const JSONBIN_API_KEY = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG';

const defaultCampaignData = {
  goal: 1800000,
  raised: 950000,
  lastUpdated: new Date().toISOString().split('T')[0]
};

const defaultDedicationsData = [
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

async function createBin(data, name) {
  try {
    const response = await fetch('https://api.jsonbin.io/v3/b', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY,
        'X-Bin-Name': name
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`Created ${name} bin with ID: ${result.metadata.id}`);
      return result.metadata.id;
    } else {
      console.error(`Failed to create ${name} bin:`, await response.text());
    }
  } catch (error) {
    console.error(`Error creating ${name} bin:`, error);
  }
}

async function setupBins() {
  console.log('Setting up JSONBin.io bins...');
  
  const campaignBinId = await createBin(defaultCampaignData, 'Chabad NF Campaign Data');
  const dedicationsBinId = await createBin(defaultDedicationsData, 'Chabad NF Dedications Data');
  
  console.log('\nUpdate your server.js with these IDs:');
  console.log(`CAMPAIGN_BIN_ID = '${campaignBinId}';`);
  console.log(`DEDICATIONS_BIN_ID = '${dedicationsBinId}';`);
}

setupBins();
