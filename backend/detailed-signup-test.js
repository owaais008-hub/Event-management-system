import axios from 'axios';

async function detailedSignupTest() {
  try {
    console.log('Testing signup with detailed error handling...');
    
    // Test data
    const signupData = {
      name: 'Test User 4',
      email: 'test4@example.com',
      password: 'password123',
      role: 'student',
      enrollmentNumber: 'EN123456',
      department: 'Computer Science'
    };
    
    console.log('Sending signup request with data:', signupData);
    
    const response = await axios.post('http://localhost:5001/api/auth/signup', signupData);
    
    console.log('Signup successful!');
    console.log('Status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    console.error('Signup failed:');
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
    
    console.error('Error config:', error.config);
  }
}

detailedSignupTest();