import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
        // Send a request to get the tokens
        const response = await axios.post('http://localhost:8000/api/v1/token/', {
            username,
            password,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Store tokens in localStorage
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('username', username);

        // Request to get the user profile
        const userResponse = await axios.get('http://localhost:8000/api/v1/profiles/', {
            headers: {
                Authorization: `Bearer ${response.data.access}`,
            },
        });

        // Find the profile matching the logged-in user
        const userProfile = userResponse.data.find(profile => profile.name === username);
        console.log(username)
        if (userProfile) {
            localStorage.setItem('user_id', userProfile.id); 
            console.log('User ID:', userProfile.id);
            // After successful login, redirect to the home page
            navigate('/');
        } else {
            setError('Profile not found');
        }
        
    } catch (err) {
        // In case of an error, display the message
        setError('Invalid credentials or profile not found');
        console.error(err);
    }
};


  return (
    <div className="login">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Login;