import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './MapPage.css'
import { useNavigate } from 'react-router-dom';

import { getAuthHeader } from '../api/utils';


const MapPage = () => {
  const [stations, setStations] = useState([]);
  const [balance, setBalance] = useState(null);
  const [selectedFrom, setSelectedFrom] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [path, setPath] = useState([]);
  const mapRef = useRef(null);
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [showRechargeInput, setShowRechargeInput] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [calculatedDistance, setCalculatedDistance] = useState(0);
  const [selectedBikeId, setSelectedBikeId] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);

  // Fetch stations, balance, and path
  useEffect(() => {
    console.log('useEffect triggered');
    const fetchStationsAndBalance = async (userLocation) => {
      try {
        const stationsResponse = await axios.post('http://127.0.0.1:8000/bike_rental/get_nearby_stations/', {
          lat: userLocation[0],
          long: userLocation[1],
        }, {
          headers: getAuthHeader()
        });
        setStations(stationsResponse.data.stations);
        console.log('Stations:', stationsResponse.data.stations);
        initMap(stationsResponse.data.stations, userLocation);
        const balanceResponse = await axios.get('http://127.0.0.1:8000/bike_rental/get_balance/', {
          headers: getAuthHeader()
        });
        setBalance(balanceResponse.data.balance);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (!mapRef.current) {
      console.log('in mapref');
      navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = [position.coords.latitude, position.coords.longitude];
        fetchStationsAndBalance(userLocation);
      });
    }
  }, [mapRef]);

const handleRecharge = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/bike_rental/add_balance/', {
        amount: rechargeAmount,
      }, {
        headers: getAuthHeader()
      });
      if (response.status === 200) {
        alert('Balance added successfully');
        // Fetch the updated balance here
        const balanceResponse = await axios.get('http://127.0.0.1:8000/bike_rental/get_balance/', {
          headers: getAuthHeader()
        });
        setBalance(balanceResponse.data.balance);
        setShowRechargeInput(false); // Hide the recharge input after successful recharge
      }
    } catch (error) {
      console.error('Error adding balance:', error);
      alert('Failed to add balance');
    }
  };

  // Initialize the map and add markers
  const initMap = (stations, userLocation) => {
    if (mapRef.current) return;
    const map = L.map('map').setView(userLocation, 13);
    mapRef.current = map;
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CartoDB',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    const userMarkerIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });

    const userMarker = L.marker(userLocation, { icon: userMarkerIcon, draggable: true })
  .addTo(map)
  .bindTooltip("My Location", { permanent: false, direction: 'top' });

    const stationMarkerIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });

    stations.forEach((station) => {
      const marker = L.marker([station.lat, station.lon], { icon: stationMarkerIcon }).addTo(map);
      marker.bindPopup(`<b>${station.name}</b><br>${station.Address}`);
    });
  };

  // Handle source and destination selection
  const handleFromChange = (event) => {
    setSelectedFrom(event.target.value);
  };

  const handleDestinationChange = (event) => {
    setSelectedDestination(event.target.value);
  };
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };
  let pathLayer = useRef(null);
  // Calculate distance and fetch path
  // Calculate distance and fetch path
  const handleCalculateDistance = async () => {
    if (!selectedFrom ||!selectedDestination) return;
  
    const fromStation = stations.find(s => s.StationID.toString() === selectedFrom);
    const toStation = stations.find(s => s.StationID.toString() === selectedDestination);
  
    if (!fromStation ||!toStation) {
      console.error('Error: One or both of the selected stations are not valid.');
      return;
    }
  
    const apiKey = '5b3ce3597851110001cf6248459503e34ff548779a910596118456f5';
    const url = `https://api.openrouteservice.org/v2/directions/cycling-road?api_key=${apiKey}&start=${fromStation.lon},${fromStation.lat}&end=${toStation.lon},${toStation.lat}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      const path = data.features[0].geometry.coordinates;
  
      //Clear any existing paths on the map 
      if (pathLayer.current) {
        pathLayer.current.remove();
        pathLayer.current = null;
      }
      const finalDiv = document.getElementById('final-div');
      if (finalDiv) {
        finalDiv.innerHTML = '';
      }

      // Reverse the order of the coordinates
      const reversedPath = path.map(coord => [coord[1], coord[0]]);
  
      const polyline = L.polyline(reversedPath, { color: 'red' });
      polyline.addTo(mapRef.current);
      pathLayer.current = polyline;

  
      const distance = data.features[0].properties.summary.distance;
      const duration = data.features[0].properties.summary.duration;
      
      const distanceInMeters = data.features[0].properties.summary.distance; // Assuming this is the distance in meters
      setCalculatedDistance(distanceInMeters);
      console.log('Distance:', distance);
      console.log('Duration:', duration);
      const costResponse = await axios.post('http://127.0.0.1:8000/bike_rental/get_estimated_cost/', {
        distance: distance/1000,
        bike_id: selectedBikeId
      }, {
        headers: getAuthHeader()
      });

      if (costResponse.status === 200) {
        const { cost, bike_type } = costResponse.data;
        // Display the result
        const finalDiv = document.getElementById('final-div');
        const parsedCost = parseFloat(cost);

        setEstimatedCost(parsedCost);
        console.log("cost is"+estimatedCost);
        if (finalDiv) {
          finalDiv.innerHTML = `Estimated cost: ${cost}, Bike type: ${bike_type}`;
        }
      } else {
        console.error('Failed to get estimated cost');
      }
      // Create a div to display the distance and duration
      const distanceDiv = document.createElement('div');
      distanceDiv.innerHTML = `Distance of trip is ${distance} meters and the duration is ${duration} seconds.`;
  
      // Display the available bikes at the source station
      const sourceStation = stations.find(s => s.StationID.toString() === selectedFrom);
      if (sourceStation) {
        
        // Check if the finalDiv element exists
        const finalDiv = document.getElementById('final-div');
        if (finalDiv) {
          // Append the distanceDiv and bikesDiv elements to the final div
          finalDiv.appendChild(distanceDiv);
        } else {
          console.error('Error: The finalDiv element does not exist in the DOM.');
        }
      }
    } catch (error) {
      console.error('Error fetching path:', error);
    }
  };

  const navigateToRidePage = async () => {
    const selectedFromStation = stations.find(station => station.StationID.toString() === selectedFrom);
    const selectedDestinationStation = stations.find(station => station.StationID.toString() === selectedDestination);
    
    if (!selectedFromStation || !selectedDestinationStation) {
        alert('Please select valid stations before navigating.');
        return;
    }
    if (estimatedCost > balance) {
      alert("Not enough balance, please recharge");
      return; // Stop the function execution if balance is insufficient
    }

    // Prepare the data for the API call
    const rideStartData = {
        start_station_id: selectedFromStation.StationID,
        end_station_id: selectedDestinationStation.StationID,
        bike_id: selectedBikeId,
    };

    try {
        // Make the API call to start the ride
        const response = await axios.post('http://127.0.0.1:8000/bike_rental/start_ride/', rideStartData, {
            headers: getAuthHeader()
        });

        if (response.status === 200) {
            // Assuming pathCoordinates should include specific route details
            const pathCoordinates = [
                [selectedFromStation.lat, selectedFromStation.lon],
                [selectedDestinationStation.lat, selectedDestinationStation.lon]
            ];

            // Navigate to the RidePage with the necessary state
            navigate('/ride', {
                state: {
                    source: [selectedFromStation.lat, selectedFromStation.lon],
                    destination: [selectedDestinationStation.lat, selectedDestinationStation.lon],
                    path: pathCoordinates,
                    bikeId: selectedBikeId,
                    sourceStationId: selectedFromStation.StationID,
                    destinationStationId: selectedDestinationStation.StationID,
                    distance: calculatedDistance/1000,
                    cost:estimatedCost
                }
            });
        } else {
            alert('Failed to start the ride. Please try again.');
        }
    } catch (error) {
        console.error('Error starting the ride:', error);
        alert('Error starting the ride. Please check your connection and try again.');
    }
};

  

  return (
    <div className="App">
      <header>
        
        <nav>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </nav>
      </header>
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to our bike booking website!</h1>
          <p>Book your bike now and enjoy the ride.</p>
        </div>
        
      </section>
      <div id="map" style={{ height: '500px' }}></div>
      <div className="station-selection">
        <div className="form-group">
          <label htmlFor="from">From:</label>
          <select id="from" className="form-control" value={selectedFrom} onChange={handleFromChange}>
            <option value="">Select a station</option>
            {stations.map((station) => (
              <option key={station.StationID} value={station.StationID}>
                {station.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="to">To:</label>
          <select id="to" className="form-control" value={selectedDestination} onChange={handleDestinationChange}>
            <option value="">Select a station</option>
            {stations.map((station) => (
              <option key={station.StationID} value={station.StationID}>
                {station.name}
              </option>
            ))}
          </select>
        </div>
        
        
      </div>
      <div id="final-div"></div>
      {selectedFrom && stations.find(s => s.StationID.toString() === selectedFrom.toString()) && (
  <div className="source-station-info">
    <div className="station-card">
      <div className="station-name">{stations.find(s => s.StationID.toString() === selectedFrom.toString()).name}</div>
      <div className="available-bikes">
      {stations.find(s => s.StationID.toString() === selectedFrom.toString()).available_bikes.map((bike) => {
  if (bike.range === -1) { // Manual bike
    return (
      <div key={bike.bikeID}>
        <input 
          type="radio" 
          id={`bike-${bike.bikeID}`} 
          name={`bike-${selectedFrom}`} 
          value={bike.bikeID}
          checked={selectedBikeId === bike.bikeID.toString()} // Ensure this bike is selected if its ID matches selectedBikeId
          onChange={(e) => setSelectedBikeId(e.target.value)}
          className="custom-radio"

        />
        <label htmlFor={`bike-${bike.bikeID}`} className="radio-label">
          Bike {bike.bikeID} - Manual
        </label>
        <button className="calculate-distance-btn" onClick={handleCalculateDistance}>
          Calculate Distance
        </button>
      </div>
    );
  } else if (bike.range > 0 && bike.range * 1000 >= calculatedDistance) { // Electric bike with sufficient range
    return (
      <div key={bike.bikeID}>
        <input 
          type="radio" 
          id={`bike-${bike.bikeID}`} 
          name={`bike-${selectedFrom}`} 
          value={bike.bikeID}
          checked={selectedBikeId === bike.bikeID.toString()} // Ensure this bike is selected if its ID matches selectedBikeId
          onChange={(e) => setSelectedBikeId(e.target.value)} 
          className="custom-radio"

        />
        <label htmlFor={`bike-${bike.bikeID}`} className="radio-label">
          Bike {bike.bikeID} - Electric ({bike.range} km)
        </label>
      </div>
    );
  }
  return null; // Don't display the bike if it doesn't meet the criteria
})}
      </div>
      <button className={`calculate-distance-btn ${selectedBikeId ? 'button-selected' : ''}`} onClick={navigateToRidePage}>Book</button>    
  </div>
  </div>
)}
      {balance !== null && (
        <div className="balance">
          <p>Balance: {balance} points</p>
          <button className="recharge-btn" onClick={() => setShowRechargeInput(true)}>Recharge</button>
          {showRechargeInput && (
            <div>
              <input
                type="number"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                placeholder="Enter amount"
              />
              <button className="recharge-btn" onClick={handleRecharge}>Add Balance</button>
            </div>
          )}
        </div>
        
      )}
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

export default MapPage;