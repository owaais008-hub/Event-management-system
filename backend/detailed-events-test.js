import axios from 'axios';

async function detailedEventsTest() {
  try {
    console.log('Testing events API with detailed error handling...');
    
    // First, let's try to signup a test user
    console.log('Creating test user...');
    const signupResponse = await axios.post('http://localhost:5001/api/auth/signup', {
      name: 'Test User',
      email: 'test-events@example.com',
      password: 'password123',
      role: 'student',
      enrollmentNumber: 'EN123456',
      department: 'Computer Science'
    });
    
    console.log('Signup successful!');
    const { token } = signupResponse.data;
    
    // Set the token in the headers
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    
    // Now try to fetch events
    console.log('Fetching events...');
    const eventsResponse = await axios.get('http://localhost:5001/api/events');
    
    console.log('Events API successful!');
    console.log('Status:', eventsResponse.status);
    console.log('Events count:', eventsResponse.data.events.length);
    console.log('First event:', eventsResponse.data.events[0]);
  } catch (error) {
    console.error('Test failed:');
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

detailedEventsTest();