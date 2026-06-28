require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const errorHandler = require('./src/middleware/errorHandler');

// Import routes
const apodRoutes = require('./src/routes/apodRoutes');
const marsRoutes = require('./src/routes/marsRoutes');
const neoRoutes = require('./src/routes/neoRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: {
    success: false,
    message: 'Too many requests.',
    data: null
  }
});
app.use('/api', limiter);

// Swagger Documentation
try {
  const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.log('Swagger docs not found yet. Skipping...');
}

// Routes
app.use('/api/apod', apodRoutes);
app.use('/api/mars', marsRoutes);
app.use('/api/neo', neoRoutes);
app.use('/api/favorites', favoriteRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    data: null
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
