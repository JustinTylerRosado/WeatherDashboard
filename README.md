# Weather Dashboard

A full-stack weather dashboard that lets users search for current weather data and keeps a local history of searches.

- Depoyed Site: https://weatherdashboard-1-odui.onrender.com/
- GitHub Repo: https://github.com/JustinTylerRosado/WeatherDashboard

## Table of Contents

1. [Features](#features)  
2. [Prerequisites](#prerequisites)  
3. [Installation](#installation)  
4. [Configuration](#configuration)  
5. [Development](#development)  
6. [Production / Deployment](#production--deployment)  
8. [License](#license)  

## Features

- Search current weather by city name (powered by OpenWeather API)  
- Save search history to a local JSON file  
- Re-visit previous searches with one click  

## Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher  
- npm (comes bundled with Node.js)  
- OpenWeather API key (sign up free at https://openweathermap.org/)

## Installation

1. Clone the repo  
   ```bash
   git clone https://github.com/your-username/your-repo.git
   
2. Change into the project directory
  ```bas
cd your-repo/Develop

3. Install dependencies
  ```bash
npm install

## Configuration

1. Create a .env file inside the server/ folder:
  ```bash
touch server/.env

2. Add the following variables to server/.env:

PORT=3001
OPENWEATHER_API_KEY=your_openweather_api_key_here

## Development

1. Run client and server concurrently
  ```bash
npm run start:dev

Client: http://localhost:5173

Server: http://localhost:3001

2. Client only
  ```bash
cd client
npm install
npm run dev

3. Server only
  ```bash
cd server
npm install
npm run dev

## Production / Deployment

1. Build client and start server:
  ```bash
npm start

2. By default, the server will serve the built client from client/dist.

3. The API and front-end will both be available at http://localhost:<PORT> (defaults to 3001).

On Render:

- Use the render-build script to build both client and server:
  ```bash
npm run render-build

- Set your environment variables (OPENWEATHER_API_KEY, PORT) in the Render dashboard.

- The service’s Start Command should be:
  ```bash
npm start

## License

This project is licensed under the ISC License.
