# StayRate - Rate Management System

A rate management system for hospitality space operations, managing pricing for room types across multiple properties.

## Overview

StayRate is a REST API service that handles:
- Rate management for different room types (offices, desks, meeting rooms)
- Property and inventory tracking (properties → room types → units)
- Booking creation with automated price calculation
- External rate synchronization from third-party systems

## Architecture

### Technology Stack
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** File-based JSON storage (development only)
- **API Style:** RESTful JSON

### Data Model

```
Property (Location/Building)
  └── Room Type (e.g., "Executive Office", "Hot Desk")
      ├── Units (Individual bookable spaces)
      └── Rates (Pricing by date range and rate type)
```

## Quick Start

### Prerequisites
- Node.js v18 or higher
- npm v8 or higher

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd frc-interview

# Install dependencies
npm install

# Start the development server
npm start
```

The API will be available at `http://localhost:3000`

### Verify Installation

```bash
# Health check
curl http://localhost:3000/health

# List all rates
curl http://localhost:3000/api/rates

# List all properties
curl http://localhost:3000/api/properties
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Response Format
All responses follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

### Endpoints

#### Rates API (Fully Implemented ✅)

**List all rates**
```http
GET /api/rates
Query params: ?room_type_id=<id>&rate_type=<type>
```

**Get rate by ID**
```http
GET /api/rates/:id
```

**Create rate**
```http
POST /api/rates
Content-Type: application/json

{
  "room_type_id": "rt_001",
  "rate_type": "daily",
  "amount": 150.00,
  "currency": "USD",
  "effective_date": "2025-01-01",
  "end_date": "2025-03-31"
}
```

**Update rate**
```http
PUT /api/rates/:id
Content-Type: application/json

{
  "amount": 175.00
}
```

**Delete rate**
```http
DELETE /api/rates/:id
```

**Get rates for room type**
```http
GET /api/rates/room-type/:roomTypeId
Query params: ?date=<YYYY-MM-DD>
```

**Sync rates from external system**
```http
POST /api/rates/sync
```

#### Properties API (Scaffolded 🔨)

```http
GET    /api/properties
GET    /api/properties/:id
POST   /api/properties
PUT    /api/properties/:id
DELETE /api/properties/:id
```

#### Room Types API (Scaffolded 🔨)

```http
GET    /api/room-types
GET    /api/room-types/:id
POST   /api/room-types
PUT    /api/room-types/:id
DELETE /api/room-types/:id
```

#### Units API (Scaffolded 🔨)

```http
GET    /api/units
GET    /api/units/:id
POST   /api/units
PUT    /api/units/:id
DELETE /api/units/:id
```

#### Bookings API (Partially Implemented ⚠️)

```http
GET    /api/bookings
GET    /api/bookings/:id
POST   /api/bookings          # Price calculation NOT implemented
PUT    /api/bookings/:id
DELETE /api/bookings/:id
POST   /api/bookings/calculate-price  # NOT implemented
```

## Data Storage

The application uses a file-based database stored in the `/data` directory:

- `data/rates.json` - Rate records
- `data/properties.json` - Property records
- `data/room_types.json` - Room type records
- `data/units.json` - Unit records
- `data/bookings.json` - Booking records
- `data/external_rates.json` - Mock external rate feed

### Database Facade

The `src/db/db.js` module provides a simple ORM-like interface:

```javascript
const db = require('./db/db');

// Query all records
const rates = await db.findAll('rates');

// Query with filter
const activeRates = await db.find('rates', {
  room_type_id: 'rt_001'
});

// Find single record
const rate = await db.findOne('rates', { rate_id: 'rate_001' });

// Insert record
const newRate = await db.insert('rates', {
  rate_id: 'rate_123',
  amount: 200.00,
  // ...
});

// Update record
await db.update('rates', 'rate_123', { amount: 225.00 });

// Delete record
await db.delete('rates', 'rate_123');
```

## Development

### Project Structure

```
frc-interview/
├── README.md
├── PRD.md
├── INTERVIEW_GUIDE.md
├── package.json
├── server.js                    # Entry point
├── src/
│   ├── db/
│   │   └── db.js               # Database facade
│   ├── routes/
│   │   ├── rates.js            # Rates API (complete)
│   │   ├── properties.js       # Properties API (scaffold)
│   │   ├── roomTypes.js        # Room Types API (scaffold)
│   │   ├── units.js            # Units API (scaffold)
│   │   └── bookings.js         # Bookings API (partial)
│   ├── middleware/
│   │   └── errorHandler.js    # Global error handler
│   └── utils/
│       └── validation.js       # Validation helpers
└── data/
    ├── rates.json
    ├── properties.json
    ├── room_types.json
    ├── units.json
    ├── bookings.json
    └── external_rates.json     # Mock external feed
```

### Running Tests

```bash
npm test
```

### Development Mode

The server auto-restarts on file changes using nodemon:

```bash
npm run dev
```

## Data Seeding

The application comes pre-seeded with test data including:

- 2 properties ("Downtown Hub", "Tech Campus North")
- 5 room types across properties
- 40+ units
- 15+ rate records with **intentional gaps** for testing

### Known Data Issues

The seed data intentionally includes:
- Room types with missing rate coverage for certain date ranges
- One room type with completely missing rates
- Potential rate overlaps (edge case testing)

These issues are part of the interview exercise.

## Common Tasks

### Add a new property

```bash
curl -X POST http://localhost:3000/api/properties \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Innovation Center",
    "address": "456 Tech Blvd",
    "timezone": "America/New_York",
    "status": "active"
  }'
```

### Find applicable rate for a date

```bash
curl "http://localhost:3000/api/rates/room-type/rt_exec_office_dt?date=2025-06-15"
```

### Sync rates from external system

```bash
curl -X POST http://localhost:3000/api/rates/sync
```

## Troubleshooting

### Port already in use
If port 3000 is in use, set a custom port:

```bash
PORT=3001 npm start
```

### Data corruption
Reset the database by deleting all files in `/data` and restarting the server. The app will regenerate seed data.

### Module not found errors
Ensure all dependencies are installed:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Support

For questions or issues:
1. Review the [Product Requirements Document](PRD.md)
2. Check the [Interview Guide](INTERVIEW_GUIDE.md)
3. Contact the engineering team

## License

Proprietary - Internal Use Only
