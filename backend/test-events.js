import axios from 'axios';

async function testEvents() {
  try {
    console.log('Testing events API...');
    
    const response = await axios.get('http://localhost:5001/api/events');
    
    console.log('Events API successful!');
    console.log('Status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    console.error('Events API failed:');
    console.error('Error object:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testEvents();