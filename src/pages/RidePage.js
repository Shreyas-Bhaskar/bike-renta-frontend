import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from 'react-router-dom';
import './RidePage.css'
import { getAuthHeader } from '../api/utils';
import axios from 'axios';

const RidePage = () => {
  const location = useLocation();
  const mapRef = useRef(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const [feedback, setFeedback] = useState('');
  const [bikeId, setBikeId] = useState('');
  const [sourceStationId, setSourceStationId] = useState('');
  const [destinationStationId, setDestinationStationId] = useState('');
  const [distance, setDistance] = useState('');
  const [scheduleID, setScheduleID] = useState(null);
  const [showPaymentButton, setShowPaymentButton] = useState(false);
  const [cost, setCost] = useState(0);
  const [rideStatus, setRideStatus] = useState('Ride Started');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer(prevTime => prevTime + 1);
    }, 1000);

    return () => clearInterval(timerRef.current); // Clean up interval on unmount
  }, []);

  useEffect(() => {
    const { source, destination,bikeId,sourceStationId, destinationStationId,distance,cost } = location.state || {};
    if (source && destination && !mapRef.current) {
      const map = L.map('map').setView(source, 13);
      mapRef.current = map;
      setBikeId(bikeId);
      setSourceStationId(sourceStationId);
      setDestinationStationId(destinationStationId);
      setDistance(distance);
      setCost(cost);
      console.log(bikeId);
      console.log(sourceStationId);
      console.log(destinationStationId);
      console.log(distance);
      console.log(cost);
      // Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Markers
      const markerIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      });
      const userMarkerIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      });
  
      const userMarker = L.marker(source, { icon: userMarkerIcon, draggable: true })
    .addTo(map)
    .bindTooltip("My Location", { permanent: false, direction: 'top' });
      L.marker(source, { icon: markerIcon }).addTo(map).bindPopup("Source Location");
      L.marker(destination, { icon: markerIcon }).addTo(map).bindPopup("Destination Location");

      // Fetch and draw path
      fetchPath(source, destination, map);
    }
  }, [location.state]);

  const fetchPath = async (source, destination, map) => {
    const apiKey = '5b3ce3597851110001cf6248459503e34ff548779a910596118456f5';
    const url = `https://api.openrouteservice.org/v2/directions/cycling-road?api_key=${apiKey}&start=${destination[1]},${destination[0]}&end=${source[1]},${source[0]}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const path = data.features[0].geometry.coordinates;
      const reversedPath = path.map(coord => [coord[1], coord[0]]); // Reverse the order of the coordinates

      L.polyline(reversedPath, { color: 'red' }).addTo(map);
      map.fitBounds(L.polyline(reversedPath).getBounds());
    } catch (error) {
      console.error('Failed to fetch path data:', error);
    }
  };
  const submitFeedback = async () => {
    try {
        console.log(bikeId)
        console.log(sourceStationId)
        console.log(destinationStationId)
      const response = await axios.post('https://8mvr5l-8000.csb.app/bike_rental/give_feedback/', {
        bike_id : bikeId,
        feedback: feedback,
        rating:'5',
        station_id : sourceStationId,
        end_station_id:destinationStationId
        // Include other required fields as per your API's specification
      }, {
        headers: getAuthHeader() // Assuming you have a function to get auth headers
      });
  
      if (response.status === 200) {
        alert('Feedback submitted successfully');
        setFeedback(''); // Clear the feedback textarea
        setFeedbackSubmitted(true); // Indicate feedback has been submitted

      } else {
        alert('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback');
    }
  };
  const displayTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndRide = async () => {
    try {
      const response = await axios.post('https://8mvr5l-8000.csb.app/bike_rental/end_ride/', {
        bike_id: bikeId,
      }, {
        headers: getAuthHeader()
      });
  
      if (response.status === 200) {
        setScheduleID(response.data.ScheduleID);
        clearInterval(timerRef.current); // Stop the timer
        setShowPaymentButton(true); // Show the "Make Payment" button
        setRideStatus('Ride Ended'); // Update ride status
      alert(`Ride ended successfully. Your ride cost is ${cost}`);
      
        // Additional logic to handle UI changes can be added here
      } else {
        alert('Failed to end the ride');
      }
    } catch (error) {
      console.error('Error ending the ride:', error);
      alert('Error ending the ride');
    }
  };
  const handleMakePayment = async () => {
    try {
      // Assuming `amount` and `scheduleID` are state variables that hold the cost and the schedule ID respectively
      const paymentData = {
        ScheduleID: scheduleID,
        amount: cost, // Ensure this variable holds the cost of the ride
      };
      console.log(cost);
      console.log(paymentData['amount']);
      const response = await axios.post('https://8mvr5l-8000.csb.app/bike_rental/make_payment/', paymentData, {
        headers: getAuthHeader() // Adds Authorization header
      });
  
      if (response.status === 200) {
        alert('Payment successful');
        // Additional logic to handle after payment success can be added here
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error making payment:', error);
      alert('Error making payment. Please check your connection and try again.');
    }
  };
  return (
    <div className="App">
    <header>
      <nav>
      <ul>
          <li><a href="/">Logout</a></li>
            <li><a href="https://8mvr5l-8000.csb.app/admin">Admin Login</a></li>
            <li><a href="/transactionPage">Ride History</a></li>
          </ul>
      </nav>
    </header>
    <section className="hero">
      <div className="hero-content">
        <h1>Your Ride is On!</h1>
        <p>Enjoy your journey and ride safely.</p>
      </div>
    </section>
    <div className="map-and-info">
      <div id="map" style={{ height: '300px', width: '300px' }}></div>
      <div className="ride-info">
  <h2>{rideStatus}</h2>
  {rideStatus === 'Ride Ended' && <p>Your ride cost is: {cost}</p>}
  <p>{displayTime(timer)}</p>
  {!showPaymentButton ? (
    <button className="end-ride-btn" onClick={handleEndRide}>End Ride</button>
  ) : (
    <button className="make-payment-btn" onClick={handleMakePayment}>Make Payment</button>
  )}
  <p>Please dock your bike and end the ride.</p>
      <textarea
  value={feedback}
  onChange={(e) => setFeedback(e.target.value)}
  placeholder="Enter your feedback here"
  style={{ width: '100%', height: '100px', marginTop: '20px' }}
/>
{
  !feedbackSubmitted ? (
    <button className="end-ride-btn" onClick={submitFeedback} style={{ marginTop: '10px' }}>
      Give Feedback
    </button>
  ) : (
    <p>Thank you for your feedback!</p>
  )
}
</div>

    </div>
    <footer>
      <p>Copyright © 2023 Bike Booking Inc. All rights reserved.</p>
      <ul>
        <li><a href="#">Facebook</a></li>
        <li><a href="#">Twitter</a></li>
        <li><a href="#">Instagram</a></li>
      </ul>
    </footer>
</div>

  );
};

export default RidePage;
