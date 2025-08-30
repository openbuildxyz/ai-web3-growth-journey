// server.js

import express from 'express';
import cors from 'cors';
import explainHandler from './api/explain.js';
import explainContractHandler from './api/explainContract.js';

const app = express();
const port = 3001; // We'll run our backend on a separate port

// Middleware to parse JSON bodies and handle CORS
app.use(express.json());
app.use(cors());

// Define our API routes
// When a request comes to /api/explain, use the logic from explain.js
app.post('/api/explain', explainHandler);

// When a request comes to /api/explainContract, use the logic from explainContract.js
app.post('/api/explainContract', explainContractHandler);

// Start the server
app.listen(port, () => {
  console.log(`✅ Backend server listening at http://localhost:${port}`);
});