import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { getAuthHeader } from '../api/utils';

const MapPage = () => {
  const [stations, setStations] = useState([]);
  const [balance, setBalance] = useState(null);
  const [selectedFrom, setSelectedFrom] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const mapRef = useRef(null); 
  // Fetch stations and balance
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
        initMap(stationsResponse.data.stations, userLocation); // Initialize map with stations
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
      L.marker([station.lat, station.lon], { icon: stationMarkerIcon })
      .addTo(map)
      .bindPopup(`<b>${station.name}</b><br>${station.Address}<br>Available Bikes: ${station.available_bikes.length}`);
    });
  
    // Add event listener for keydown events
    map.on('keydown', (event) => {
      const key = event.originalEvent.key;
  
      if (key === 'w') {
        // Move marker up
        const latLng = userMarker.getLatLng();
        userMarker.setLatLng([latLng.lat + 0.001, latLng.lng]);
      } else if (key === 's') {
        // Move marker down
        const latLng = userMarker.getLatLng();
        userMarker.setLatLng([latLng.lat - 0.001, latLng.lng]);
      } else if (key === 'a') {
        // Move marker left
        const latLng = userMarker.getLatLng();
        userMarker.setLatLng([latLng.lat, latLng.lng - 0.001]);
      } else if (key === 'd') {
        // Move marker right
        const latLng = userMarker.getLatLng();
        userMarker.setLatLng([latLng.lat, latLng.lng + 0.001]);
      }
    });
  };

  const handleFromChange = (event) => {
    setSelectedFrom(event.target.value);
  };

  const handleDestinationChange = (event) => {
    setSelectedDestination(event.target.value);
  };

  return (
    <div>
      <div id="map" style={{ height: '300px', width: '100%' }}></div>
      <div>
        <h2>Please Select Your Source and Destination</h2>
        <p>Make sure to top up your card.</p>
        <select value={selectedFrom} onChange={handleFromChange}>
          {stations.map((station, index) => (
            <option key={index} value={station.name}>{station.name}</option>
          ))}
        </select>
        <select value={selectedDestination} onChange={handleDestinationChange}>
          {stations.map((station, index) => (
            <option key={index} value={station.name}>{station.name}</option>
          ))}
        </select>
        <button>Book</button>
      </div>
      <div>
        <h3>Your current card balance is: {balance}</h3>
        <button onClick={() => {/* Implement recharge logic here */}}>Recharge</button>
      </div>
    </div>
  );
};

export default MapPage;