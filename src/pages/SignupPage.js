import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // Optional external CSS file

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = () => {
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPassword', password);
    navigate('/profile-setup');
  };

  return (
    <div className="signup-container">
      <h1>Create an Account</h1>
      <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
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

        <button type="button" onClick={handleSignup}>
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Signup;
