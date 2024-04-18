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
        const response = await axios.get('https://8mvr5l-8000.csb.app/bike_rental/get_payment_history/', {
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

  const handleDelete = async (transactionId) => {
    try {
      const response = await axios.delete('https://8mvr5l-8000.csb.app/bike_rental/delete_transaction/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoic2hyZXlhcyJ9.nsdHEbKuyDELvnyxSbj1ZUpwGRR4cPIBoxFv2TRH1H8'
        },
        data: {
          "transaction_id": transactionId
        }
      });
      if (response.status === 200) {
        // Refresh the transactions list
        window.location.reload();      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  return (
    <div>
      <h2>Ride History</h2>
      <table>
        <thead>
          <tr>
            <th>Cost</th>
            <th>Bike ID</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Start Station</th>
            <th>End Station</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.TransactionID}>
              <td>{transaction.Cost}</td>
              <td>{transaction.BikeID}</td>
              <td>{transaction.start_time}</td>
              <td>{transaction.end_time}</td>
              <td>{transaction.start_station}</td>
              <td>{transaction.end_station}</td>
              <td>
        <button onClick={() => handleDelete(transaction.TransactionID)}>Delete</button>
      </td> 
            </tr>
          ))}
        </tbody>
      </table>
      <button align = 'center' onClick={handleBookClick}>Book</button>
    </div>
  );
};

export default TransactionHistoryPage;