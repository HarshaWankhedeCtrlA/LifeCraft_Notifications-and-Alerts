# LifeCraft Notifications and Alerts API

Node.js, Express, and MongoDB starter API.

## Requirements

- Node.js 20 or later
- MongoDB running locally or a MongoDB connection URI

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and set `MONGODB_URI` to your MongoDB connection string.
3. Start the development server:

   ```sh
   npm run dev
   ```

The API connects to MongoDB before listening on the configured `PORT` (default `3000`).

## Endpoint

- `GET /health` — returns `200` when MongoDB is connected and `503` otherwise.
