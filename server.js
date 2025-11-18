const express = require('express');
const db = require('./src/db/db');
const errorHandler = require('./src/middleware/errorHandler');

// Import routes
const ratesRouter = require('./src/routes/rates');
const propertiesRouter = require('./src/routes/properties');
const roomTypesRouter = require('./src/routes/roomTypes');
const unitsRouter = require('./src/routes/units');
const bookingsRouter = require('./src/routes/bookings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  });
});

// API routes
app.use('/api/rates', ratesRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/room-types', roomTypesRouter);
app.use('/api/units', unitsRouter);
app.use('/api/bookings', bookingsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND'
    }
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
async function start() {
  try {
    console.log('Initializing database...');
    await db.seed();
    console.log('Database initialized with seed data');

    app.listen(PORT, () => {
      console.log(`\n🚀 SpaceRate Pro API running on http://localhost:${PORT}`);
      console.log(`📖 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API Documentation: See README.md\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

module.exports = app;
