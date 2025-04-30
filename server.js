const express = require('express');
const axios = require('axios');
const fs = require('fs');
const uuid = require('uuid');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(express.static('public'));  // Serve static files (e.g., index.html)

// OpenWeather API key
const API_KEY = process.env.OPENWEATHER_API_KEY;

// Route to serve the index.html
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Route to get search history
app.get('/api/weather/history', (req, res) => {
  fs.readFile('searchHistory.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading search history.');
    }
    res.json(JSON.parse(data));
  });
});

// Route to save a city and fetch weather data
app.post('/api/weather', async (req, res) => {
  const cityName = req.body.cityName;

  // Generate a unique ID for the city
  const cityId = uuid.v4();

  // Get coordinates for the city using OpenWeather's Geocoding API
  try {
    const geoResponse = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`
    );
    const { lat, lon } = geoResponse.data.coord;

    // Get weather data using OpenWeather's 5-day forecast API
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    // Prepare city data to be saved
    const cityData = {
      id: cityId,
      name: cityName,
      weather: weatherResponse.data,
    };

    // Save the city to search history
    fs.readFile('searchHistory.json', 'utf8', (err, data) => {
      let searchHistory = [];
      if (!err && data) {
        searchHistory = JSON.parse(data);
      }
      searchHistory.push(cityData);

      fs.writeFile('searchHistory.json', JSON.stringify(searchHistory), (err) => {
        if (err) {
          return res.status(500).send('Error saving search history.');
        }
        res.json(cityData);  // Return the weather data for the city
      });
    });
  } catch (error) {
    res.status(500).send('Error fetching weather data.');
  }
});

// Route to delete a city from search history
app.delete('/api/weather/history/:id', (req, res) => {
  const cityId = req.params.id;

  fs.readFile('searchHistory.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading search history.');
    }

    let searchHistory = JSON.parse(data);
    searchHistory = searchHistory.filter((city) => city.id !== cityId);

    fs.writeFile('searchHistory.json', JSON.stringify(searchHistory), (err) => {
      if (err) {
        return res.status(500).send('Error updating search history.');
      }
      res.sendStatus(200);  // Successfully deleted
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});