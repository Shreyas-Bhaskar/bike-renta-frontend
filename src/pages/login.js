import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Login = ({ history }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const response = await fetch('http://127.0.0.1:8000/bike_rental/login/', { // Replace '/api/login' with your actual API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        localStorage.setItem('token', data.token); // Save the token
        navigate('/mappage'); // Navigate to the Map page
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (error) {
      setError('Failed to connect to the server');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '0 1rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          width: '30rem',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: '1rem',
          }}
        >
          Login
        </h2>
        <form onSubmit={handleLogin}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '1rem',
            }}
          >
            <label
              style={{
                marginBottom: '0.5rem',
              }}
            >
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                borderRadius: '0.25rem',
                border: '1px solid #ccc',
                padding: '0.5rem',
                fontSize: '1rem',
                width: '100%',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '1rem',
            }}
          >
            <label
              style={{
                marginBottom: '0.5rem',
              }}
            >
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                borderRadius: '0.25rem',
                border: '1px solid #ccc',
                padding: '0.5rem',
                fontSize: '1rem',
                width: '100%',
              }}
            />
          </div>
          {error && <p
            style={{
              color: 'red',
              marginBottom: '1rem',
            }}
          >
            {error}
          </p>}
          <button
            type="submit"
            style={{
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '0.25rem',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;