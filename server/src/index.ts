import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { initializeDatabase } from './utils/initDb.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  await initializeDatabase();
  
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (0.0.0.0)`);
  });
}

startServer();
