import { Express, Router } from 'express';
import { submitPackageScan, submitRepositoryScan, getScanResults, getThreatIntelligence } from './controllers/scanController';
import { githubLogin, githubCallback } from './controllers/authController';

export function setupRoutes(app: Express) {
  const router = Router();

  // ----- Authentication Routes -----
  router.get('/auth/github/login', githubLogin);
  router.get('/auth/github/callback', githubCallback);

  // ----- Scan & Threat Intel Routes -----
  router.post('/scan/package', submitPackageScan);
  router.post('/scan/repository', submitRepositoryScan);
  
  router.get('/scan/results/:scanId', getScanResults);
  router.get('/packages/risk/:packageName', getThreatIntelligence);

  app.use('/api/v1', router);
}
