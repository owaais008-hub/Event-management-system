import axios from 'axios';

async function testSignup() {
  try {
    console.log('Testing signup...');
    
    const response = await axios.post('http://localhost:5001/api/auth/signup', {
      name: 'Test User',
      email: 'test3@example.com',
      password: 'password123',
      role: 'student',
      enrollmentNumber: 'EN123456',
      department: 'Computer Science'
    });
    
    console.log('Signup successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Signup failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testSignup();