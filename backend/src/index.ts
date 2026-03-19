import 'dotenv/config';
import express from 'express';
import { setupRoutes } from './api/routes';

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (allow frontend)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'npm-guardian-api' });
});

// Setup API Routes
setupRoutes(app);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error]', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 npm-Guardian API Gateway running on http://localhost:${PORT}`);
  console.log(`📦 Supabase URL: ${process.env.SUPABASE_URL || 'NOT SET'}`);
});
