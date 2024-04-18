import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupPage = ({ history }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://stingray-app-eibd8.ondigitalocean.app/bike_rental/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok) {
        localStorage.setItem('token', responseData.token);
        navigate('/login'); 
      } else {
        setError(responseData.error || 'An error occurred during signup.');
      }
    } catch (error) {
      console.log(error);
      setError('Failed to connect to the server.');
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
          Sign Up
        </h2>
        {error && <p
          style={{
            color: 'red',
            marginBottom: '1rem',
          }}
        >
          {error}
        </p>}
        <form onSubmit={handleSignup}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            style={{
              display: 'block',
              width: '100%',
              marginBottom: '1rem',
              padding: '0.5rem',
              fontSize: '1rem',
              borderRadius: '0.25rem',
              border: '1px solid #ccc',
            }}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              display: 'block',
              width: '100%',
              marginBottom: '1rem',
              padding: '0.5rem',
              fontSize: '1rem',
              borderRadius: '0.25rem',
              border: '1px solid #ccc',
            }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              display: 'block',
              width: '100%',
              marginBottom: '1rem',
              padding: '0.5rem',
              fontSize: '1rem',
              borderRadius: '0.25rem',
              border: '1px solid #ccc',
            }}
          />
          <button
            type="submit"
            style={{
              display: 'block',
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              borderRadius: '0.25rem',
              border: 'none',
              backgroundColor: '#007bff',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;