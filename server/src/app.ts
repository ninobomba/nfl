import express from 'express';
import type { Express } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import dataRoutes from './routes/data.routes.js';
import picksRoutes from './routes/picks.routes.js';
import adminRoutes from './routes/admin.routes.js';
import standingsRoutes from './routes/standings.routes.js';

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', dataRoutes);
app.use('/api/picks', picksRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/standings', standingsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
