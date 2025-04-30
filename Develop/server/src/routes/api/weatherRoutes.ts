import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const router = Router();
const historyFilePath = path.join(__dirname, '../../../db/db.json');
const API_KEY = process.env.OPENWEATHER_API_KEY!;
interface Forecast { city:string; date:string; icon:string; iconDescription:string; tempF:string; windSpeed:string; humidity:number; }

// GET /api/weather/history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const raw = fs.existsSync(historyFilePath) ? fs.readFileSync(historyFilePath,'utf-8') : '[]';
    res.json(JSON.parse(raw));
  } catch {
    res.status(500).json({ message: 'Could not read history' });
  }
});

// POST /api/weather
router.post('/', async (req: Request, res: Response) => {
  const cityName = (req.body.cityName as string || '').trim();
  if (!cityName) return res.status(400).json({ message: 'cityName is required' });

  try {
    // geocode
    const geo = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`);
    if (!geo.data.length) return res.status(404).json({ message: 'City not found' });
    const { lat, lon, name } = geo.data[0];

    // forecast
    const weather = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`);
    const list = weather.data.list as any[];

    // current
    const now = list[0];
    const current: Forecast = {
      city: name,
      date: new Date(now.dt*1000).toLocaleDateString('en-US'),
      icon: now.weather[0].icon,
      iconDescription: now.weather[0].description,
      tempF: now.main.temp.toFixed(0),
      windSpeed: now.wind.speed.toFixed(0),
      humidity: now.main.humidity
    };

    // 5-day
    const forecast = list
      .filter(i => i.dt_txt.includes('12:00:00'))
      .slice(0,5)
      .map(i => ({
        date: new Date(i.dt*1000).toLocaleDateString('en-US'),
        icon: i.weather[0].icon,
        iconDescription: i.weather[0].description,
        tempF: i.main.temp.toFixed(0),
        windSpeed: i.wind.speed.toFixed(0),
        humidity: i.main.humidity
      }));

    // save history
    const entry = { id: uuidv4(), name };
    const existing = fs.existsSync(historyFilePath) ? JSON.parse(fs.readFileSync(historyFilePath,'utf-8')) : [];
    existing.push(entry);
    fs.writeFileSync(historyFilePath, JSON.stringify(existing,null,2));

    return res.json([current, ...forecast]);
  } catch {
    return res.status(500).json({ message: 'Error retrieving weather data' });
  }
});

// DELETE /api/weather/history/:id
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = fs.existsSync(historyFilePath) ? JSON.parse(fs.readFileSync(historyFilePath,'utf-8')) : [];
    const updated = existing.filter((c:any) => c.id !== id);
    fs.writeFileSync(historyFilePath, JSON.stringify(updated,null,2));
    return res.json({ message: 'Deleted' });
  } catch {
    return res.status(500).json({ message: 'Error deleting city' });
  }
});

export default router;