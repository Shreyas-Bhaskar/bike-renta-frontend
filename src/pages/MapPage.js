import React, { useEffect, useState } from 'react';
import axios from 'axios';
import L from 'leaflet';
import { getAuthHeader } from '../api/utils';

const MapPage = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await axios.post('http://127.0.0.1:8000/bike_rental/nearest/', {
          lat: latitude,
          long: longitude,
        }, {
          headers: getAuthHeader(),
        });

        setLocations(response.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    });
  }, []);


  useEffect(() => {
    if (locations.length > 0) {
      const map = L.map('map').setView([locations[0].lat, locations[0].long], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      locations.forEach((location) => {
        L.marker([location.lat, location.long]).addTo(map).bindPopup(`<strong>${location.name}</strong><br>${location.address}`);
      });
    }
  }, [locations]);

  return (
    <div id="map" style={{ height: '500px' }}></div>
  );
};

export default MapPage;