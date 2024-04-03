import React from 'react'
import { Link } from 'react-router-dom'
import './HomePage.css'

const HomePage = () => {
  return (
    <div className="homepage-container">
      <div className="homepage-welcome-container">
        <h1 className="homepage-title">Welcome to Bike Rental Service</h1>
        <p className="homepage-description">
          Explore the city with our diverse range of bikes. Easy, affordable, and fun!
        </p>
      </div>
      <div className="how-it-works-container">
        <h2 className="how-it-works-title">How It Works</h2>
        <ol className="how-it-works-list">
          <li className="how-it-works-item">
            Sign up or log in to your account.
          </li>
          <li className="how-it-works-item">
            Choose your bike and pickup station.
          </li>
          <li className="how-it-works-item">
            Enjoy your ride and return the bike to any station.
          </li>
        </ol>
      </div>
      <div className="cta-container">
        <Link to="/signup" className="cta-button">
          Sign Up
        </Link>
        <Link to="/login" className="cta-button">
          Log In
        </Link>
      </div>
    </div>
  )
}

export default HomePage