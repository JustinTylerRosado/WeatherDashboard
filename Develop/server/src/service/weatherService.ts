import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export interface WeatherEntry {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: string;
  windSpeed: string;
  humidity: number;
}

interface GeocodeResult {
  lat: number;
  lon: number;
  name: string;
}

// TODO: Define an interface for the Coordinates object

// TODO: Define a class for the Weather object

// TODO: Complete the WeatherService class
class WeatherService {
  private apiKey: string;
  private geoBase = 'http://api.openweathermap.org/geo/1.0/direct';
  private forecastBase = 'https://api.openweathermap.org/data/2.5/forecast';

  constructor() {
    if (!process.env.OPENWEATHER_API_KEY) {
      throw new Error('Missing OPENWEATHER_API_KEY in environment');
    }
    this.apiKey = process.env.OPENWEATHER_API_KEY;
  }

  /** 
   * Fetches current + five‑day forecast for a given city name.
   * Returns an array: [ currentWeather, ...5 forecasts ] 
   */
  async getWeatherForCity(cityName: string): Promise<WeatherEntry[]> {
    // 1) Turn cityName → lat/lon via the geocoding endpoint
    const { lat, lon, name } = await this.fetchCoordinates(cityName);

    // 2) Fetch 5‑day forecast (3‑hr step) in imperial units
    const forecastData = await this.fetchForecast(lat, lon);
    const list = forecastData.list as any[];

    // 3) Build the “current” entry from the first available item
    const now = list[0];
    const current: WeatherEntry = {
      city: name,
      date: new Date(now.dt * 1000).toLocaleDateString('en-US'),
      icon: now.weather[0].icon,
      iconDescription: now.weather[0].description,
      tempF: now.main.temp.toFixed(0),
      windSpeed: now.wind.speed.toFixed(0),
      humidity: now.main.humidity
    };

    // 4) Build five forecast entries (choose the “12:00:00” slice for each day)
    const forecast: WeatherEntry[] = list
      .filter((item) => item.dt_txt.includes('12:00:00'))
      .slice(0, 5)
      .map((item) => ({
        city: name, // optional for consistency
        date: new Date(item.dt * 1000).toLocaleDateString('en-US'),
        icon: item.weather[0].icon,
        iconDescription: item.weather[0].description,
        tempF: item.main.temp.toFixed(0),
        windSpeed: item.wind.speed.toFixed(0),
        humidity: item.main.humidity
      }));

    return [current, ...forecast];
  }

  /** Call OpenWeather Geocoding API */
  private async fetchCoordinates(city: string): Promise<GeocodeResult> {
    const url = `${this.geoBase}?q=${encodeURIComponent(city)}&limit=1&appid=${this.apiKey}`;
    const resp = await axios.get(url);
    const data = resp.data as any[];
    if (!data.length) {
      throw new Error(`City "${city}" not found`);
    }
    return {
      lat: data[0].lat,
      lon: data[0].lon,
      name: data[0].name
    };
  }

  /** Call OpenWeather Forecast API */
  private async fetchForecast(lat: number, lon: number): Promise<any> {
    const url = `${this.forecastBase}?lat=${lat}&lon=${lon}&units=imperial&appid=${this.apiKey}`;
    const resp = await axios.get(url);
    return resp.data;
  }
}

export default new WeatherService();