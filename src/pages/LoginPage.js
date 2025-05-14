// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      try {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        setSuccessMessage('Login successful! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
      }
    } else {
      alert('Please enter email and password');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form className="login-form" onSubmit={handleLogin}>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <p className="back-link">
        <Link to="/">← Back to Home</Link>
      </p>
    </div>
  );
};

export default LoginPage;
