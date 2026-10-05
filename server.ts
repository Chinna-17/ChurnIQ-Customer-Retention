import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Paths to model artifacts and dataset
const MODEL_DIR = path.join(__dirname, 'model');
const ANALYTICS_FILE = path.join(MODEL_DIR, 'analytics_summary.json');
const ARTIFACTS_FILE = path.join(MODEL_DIR, 'model_artifacts.json');
const CUSTOMERS_FILE = fs.existsSync(path.join(MODEL_DIR, 'customers_data.json'))
  ? path.join(MODEL_DIR, 'customers_data.json')
  : path.join(MODEL_DIR, 'customers_sample.json');
const PREDICT_SCRIPT = path.join(__dirname, 'ml', 'predict_single.py');

let cachedCustomers: any[] | null = null;

function getCustomersList(): any[] {
  if (cachedCustomers) return cachedCustomers;
  cachedCustomers = readJsonFile(CUSTOMERS_FILE) || [];
  return cachedCustomers!;
}

function readJsonFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return null;
}

// REST API Endpoints

app.get('/api/health', (_req: Request, res: Response) => {
  const modelExists = fs.existsSync(path.join(MODEL_DIR, 'churn_model.pkl'));
  res.json({
    status: 'healthy',
    service: 'ChurnIQ Intelligence Platform',
    model_loaded: modelExists,
    version: '1.0.0',
    total_customers: getCustomersList().length,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/summary', (_req: Request, res: Response) => {
  const analytics = readJsonFile(ANALYTICS_FILE);
  if (analytics && analytics.datasetOverview) {
    return res.json(analytics.datasetOverview);
  }
  res.status(500).json({ error: 'Summary metrics not available' });
});

app.get('/api/analytics', (_req: Request, res: Response) => {
  const analytics = readJsonFile(ANALYTICS_FILE);
  if (analytics) {
    return res.json(analytics);
  }
  res.status(500).json({ error: 'Analytics data not found' });
});

app.get('/api/model-metrics', (_req: Request, res: Response) => {
  const artifacts = readJsonFile(ARTIFACTS_FILE);
  if (artifacts) {
    return res.json(artifacts);
  }
  res.status(500).json({ error: 'Model artifacts not found' });
});

app.get('/api/feature-importance', (_req: Request, res: Response) => {
  const artifacts = readJsonFile(ARTIFACTS_FILE);
  if (artifacts && artifacts.feature_importance) {
    return res.json(artifacts.feature_importance);
  }
  res.status(500).json({ error: 'Feature importance data not found' });
});

app.get('/api/customers/:id', (req: Request, res: Response) => {
  const customerId = req.params.id;
  const customers = getCustomersList();
  const customer = customers.find(c => c.customerID?.toLowerCase() === customerId?.toLowerCase());
  if (customer) {
    return res.json(customer);
  }
  res.status(404).json({ error: `Customer with ID ${customerId} not found` });
});

app.get('/api/customers', (req: Request, res: Response) => {
  const customers = getCustomersList();

  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const churnFilter = typeof req.query.churn === 'string' ? req.query.churn.trim() : '';
  const contractFilter = typeof req.query.contract === 'string' ? req.query.contract.trim() : '';
  const riskFilter = typeof req.query.risk === 'string' ? req.query.risk.trim() : '';
  const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'predictedProbability';
  const sortOrder = req.query.order === 'asc' ? 'asc' : 'desc';

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));

  let filtered = [...customers];

  if (search) {
    filtered = filtered.filter(c => c.customerID?.toLowerCase().includes(search));
  }

  if (churnFilter && churnFilter !== 'all') {
    filtered = filtered.filter(c => c.Churn?.toLowerCase() === churnFilter.toLowerCase());
  }

  if (contractFilter && contractFilter !== 'all') {
    filtered = filtered.filter(c => c.Contract?.toLowerCase() === contractFilter.toLowerCase());
  }

  if (riskFilter && riskFilter !== 'all') {
    filtered = filtered.filter(c => c.riskLevel?.toLowerCase() === riskFilter.toLowerCase());
  }

  filtered.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (typeof valA === 'number' || typeof valB === 'number') {
      const numA = Number(valA) || 0;
      const numB = Number(valB) || 0;
      return sortOrder === 'asc' ? numA - numB : numB - numA;
    }

    valA = (valA ?? '').toString().toLowerCase();
    valB = (valB ?? '').toString().toLowerCase();
    return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIdx = (page - 1) * limit;
  const paginatedRecords = filtered.slice(startIdx, startIdx + limit);

  res.json({
    total,
    page,
    limit,
    totalPages,
    customers: paginatedRecords
  });
});

app.post('/api/predict', (req: Request, res: Response) => {
  const customerData = req.body;
  if (!customerData || typeof customerData !== 'object') {
    return res.status(400).json({ error: 'Please check the highlighted fields.' });
  }

  // Execute the real scikit-learn Python inference engine
  const pyProcess = spawn('python3', [PREDICT_SCRIPT, JSON.stringify(customerData)]);

  let stdout = '';
  let stderr = '';

  pyProcess.stdout.on('data', (data) => {
    stdout += data.toString();
  });

  pyProcess.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  pyProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Python inference error code:', code, stderr);
      return res.status(500).json({
        error: "We couldn't complete the analysis. Please try again."
      });
    }

    try {
      const result = JSON.parse(stdout.trim());
      res.json(result);
    } catch (parseError) {
      console.error('Failed to parse Python inference JSON output:', stdout, parseError);
      res.status(500).json({
        error: "We couldn't complete the analysis. Please try again."
      });
    }
  });

  pyProcess.on('error', (err) => {
    console.error('Failed to start python process:', err);
    res.status(503).json({
      error: 'Prediction service is currently unavailable. Please try again.'
    });
  });
});

// Setup Vite middleware or static serving
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ChurnIQ] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[ChurnIQ] Failed to start server:', err);
});
