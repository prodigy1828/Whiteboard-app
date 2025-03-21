import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Add name for registration
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    const endpoint = isRegistering ? 'register' : 'login';
  
    try {
      const response = await fetch(`http://localhost:3030/users/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          isRegistering 
            ? { email, password, name }
            : { email, password }
        ),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        if (isRegistering) {
          // If registration is successful, switch to login mode
          setIsRegistering(false);
          setEmail('');
          setPassword('');
          setName('');
          setError('Registration successful! Please login.');
        } else {
          // If login is successful, store token and navigate to profile
          localStorage.setItem('token', data.token);
          navigate('/profile');
        }
      } else {
        setError(data.message || `${isRegistering ? 'Registration' : 'Login'} failed`);
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        {error && (
          <div className={`message ${error.includes('successful') ? 'success-message' : 'error-message'}`}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isRegistering}
                placeholder="Enter your name"
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit">
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>
        <div className="toggle-form">
          <button onClick={toggleMode} className="toggle-button">
            {isRegistering 
              ? 'Already have an account? Login' 
              : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;