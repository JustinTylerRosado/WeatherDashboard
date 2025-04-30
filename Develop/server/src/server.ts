import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';


import weatherRoutes from './routes/api/weatherRoutes.js';
import htmlRoutes from './routes/htmlRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientBuildPath = path.join(__dirname, '../../client/dist');

app.use(express.static(clientBuildPath));

app.get('*', (_req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });

app.use('/api/weather', weatherRoutes);
app.use('/', htmlRoutes);

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));