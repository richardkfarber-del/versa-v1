require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Initialize database schema checks
require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup: Restrict to trusted origins
const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:5173', 
    'https://versa-v1-1.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Rate limiting middleware for endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: { success: false, error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

// Parse JSON bodies
app.use(express.json());

// Import Modular Routers
const authRouter = require('./routes/auth');
const { router: relationshipRouter } = require('./routes/relationship');
const compassRouter = require('./routes/compass');
const itineraryRouter = require('./routes/itinerary');
const feedbackRouter = require('./routes/feedback');
const productsRouter = require('./routes/products');
const { router: syncRouter, pullDatabase } = require('./routes/sync');
const { router: adminRouter } = require('./routes/admin');

// Mount Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/relationship', relationshipRouter);
app.use('/api/v1/compass', compassRouter);
app.use('/api/v1/itinerary', itineraryRouter);
app.use('/api/v1/feedback', feedbackRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/sync', syncRouter);
app.use('/api/v1/admin', adminRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error.' });
});

// Start Server
(async () => {
  // Execute startup sync check
  await pullDatabase();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Versa Unified Backend running on http://0.0.0.0:${PORT}`);
  });
})();
