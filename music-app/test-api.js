// Quick test script for Deezer API
import axios from 'axios';

async function testDeezerAPI() {
  try {
    console.log('Testing Deezer API...\n');
    
    // Test 1: Get chart tracks
    console.log('1. Fetching chart tracks...');
    const response = await axios.get('https://api.deezer.com/chart/0/tracks?limit=5');
    console.log(`✓ Success! Got ${response.data.data.length} tracks`);
    console.log(`First track: ${response.data.data[0].title} by ${response.data.data[0].artist.name}\n`);
    
    // Test 2: Search
    console.log('2. Testing search...');
    const searchResponse = await axios.get('https://api.deezer.com/search?q=eminem');
    console.log(`✓ Search successful! Found ${searchResponse.data.data.length} results\n`);
    
    // Test 3: Get specific track
    console.log('3. Fetching specific track...');
    const trackResponse = await axios.get('https://api.deezer.com/track/3135556');
    console.log(`✓ Track details: ${trackResponse.data.title}\n`);
    
    console.log('All API tests passed! ✓');
    
  } catch (error) {
    console.error('API Test Failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testDeezerAPI();
