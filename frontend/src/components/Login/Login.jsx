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
      // Відправляємо запит на отримання токенів
      const response = await axios.post('http://localhost:8000/api/v1/token/', {
        username,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Зберігаємо токени в localStorage
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('username', username);

      // Запит на отримання профілю користувача
      const userResponse = await axios.get('http://localhost:8000/api/v1/profiles/', {
        headers: {
          Authorization: `Bearer ${response.data.access}`,
        },
      });

      // Перевіряємо чи є відповідь на профіль
      if (userResponse.data && userResponse.data.length > 0) {
        // Зберігаємо ID користувача в localStorage
        localStorage.setItem('user_id', userResponse.data[0].id); 
        console.log('User ID:', userResponse.data[0].id);

        // Після успішного логіну перенаправляємо на головну сторінку
        navigate('/');
      } else {
        throw new Error('Profile not found');
      }
      
    } catch (err) {
      // У випадку помилки відображаємо повідомлення
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
