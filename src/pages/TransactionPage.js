// TransactionHistoryPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuthHeader } from '../api/utils';
import './TransactionPage.css'

const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/bike_rental/get_payment_history/', {
          headers: getAuthHeader(),
        });
        setTransactions(response.data);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  const handleBookClick = () => {
    navigate('/MapPage'); // Assuming '/MapPage' is the correct path to the map page
  };

  return (
    <div>
      <h2>Transaction History</h2>
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Cost</th>
            <th>Bike ID</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Start Station</th>
            <th>End Station</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.TransactionID}>
              <td>{transaction.TransactionID}</td>
              <td>{transaction.Cost}</td>
              <td>{transaction.BikeID}</td>
              <td>{transaction.start_time}</td>
              <td>{transaction.end_time}</td>
              <td>{transaction.start_station}</td>
              <td>{transaction.end_station}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button align = 'center' onClick={handleBookClick}>Book</button>
    </div>
  );
};

export default TransactionHistoryPage;