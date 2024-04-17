import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';
import MapPage from './pages/MapPage';
import RidePage from './pages/RidePage';
import TransactionPage from './pages/TransactionPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/MapPage" element={<MapPage />} />
        <Route path="/ride" element={<RidePage/> } />
        <Route path="/transaction-history" element={<TransactionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
