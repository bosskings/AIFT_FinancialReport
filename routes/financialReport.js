import express from 'express';
import { generateReport, getReport } from '../controllers/financialReport.js';

const financeRouter = express.Router();


financeRouter.post('/generate', generateReport);

/**
 * GET /api/financial-report/:reportId
 * Retrieve a previously generated report
 */
financeRouter.get('/:reportId', getReport);

export default financeRouter;
