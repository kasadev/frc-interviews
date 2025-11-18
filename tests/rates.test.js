/**
 * Tests for Rates API
 *
 * NOTE: Some of these tests contain bugs that don't align with the PRD.
 * Candidates should review these tests and identify misalignments with product requirements.
 */

const request = require('supertest');
const app = require('../server');
const db = require('../src/db/db');

describe('Rates API', () => {
  beforeEach(async () => {
    // Reset database before each test
    await db.seed();
  });

  describe('GET /api/rates', () => {
    it('should return all rates', async () => {
      const response = await request(app)
        .get('/api/rates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rates).toBeInstanceOf(Array);
      expect(response.body.data.count).toBeGreaterThan(0);
    });

    it('should filter rates by room_type_id', async () => {
      const response = await request(app)
        .get('/api/rates?room_type_id=rt_exec_office_dt')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.rates.forEach(rate => {
        expect(rate.room_type_id).toBe('rt_exec_office_dt');
      });
    });

    it('should filter rates by rate_type', async () => {
      const response = await request(app)
        .get('/api/rates?rate_type=daily')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.rates.forEach(rate => {
        expect(rate.rate_type).toBe('daily');
      });
    });
  });

  describe('GET /api/rates/:id', () => {
    it('should return a specific rate by ID', async () => {
      const response = await request(app)
        .get('/api/rates/rate_exec_dt_daily_q1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rate_id).toBe('rate_exec_dt_daily_q1');
    });

    it('should return 404 for non-existent rate', async () => {
      const response = await request(app)
        .get('/api/rates/nonexistent_id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/rates', () => {
    it('should create a new rate with valid data', async () => {
      const newRate = {
        room_type_id: 'rt_exec_office_dt',
        rate_type: 'daily',
        amount: 200.00,
        currency: 'USD',
        effective_date: '2026-01-01',
        end_date: '2026-12-31'
      };

      const response = await request(app)
        .post('/api/rates')
        .send(newRate)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(200);
      expect(response.body.data.rate_id).toBeDefined();
    });

    // BUG: This test expects invalid currency to be accepted, but PRD says currency must be valid
    it('should accept any currency code', async () => {
      const newRate = {
        room_type_id: 'rt_exec_office_dt',
        rate_type: 'daily',
        amount: 200.00,
        currency: 'INVALID_CURRENCY', // This should fail validation per PRD
        effective_date: '2026-01-01',
        end_date: '2026-12-31'
      };

      const response = await request(app)
        .post('/api/rates')
        .send(newRate)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should reject rate with missing required fields', async () => {
      const invalidRate = {
        room_type_id: 'rt_exec_office_dt',
        amount: 200.00
        // Missing rate_type, currency, dates
      };

      const response = await request(app)
        .post('/api/rates')
        .send(invalidRate)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject rate with effective_date after end_date', async () => {
      const invalidRate = {
        room_type_id: 'rt_exec_office_dt',
        rate_type: 'daily',
        amount: 200.00,
        currency: 'USD',
        effective_date: '2026-12-31',
        end_date: '2026-01-01' // Wrong order
      };

      const response = await request(app)
        .post('/api/rates')
        .send(invalidRate)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    // BUG: This test expects overlapping rates to be accepted, but PRD says they should be rejected
    it('should allow creating overlapping rate periods', async () => {
      const overlappingRate = {
        room_type_id: 'rt_exec_office_dt',
        rate_type: 'daily',
        amount: 180.00,
        currency: 'USD',
        effective_date: '2025-02-01', // Overlaps with existing Q1 rate
        end_date: '2025-05-31'
      };

      const response = await request(app)
        .post('/api/rates')
        .send(overlappingRate)
        .expect(201); // Should actually be 400 per PRD

      expect(response.body.success).toBe(true);
    });

    it('should reject negative amounts', async () => {
      const invalidRate = {
        room_type_id: 'rt_exec_office_dt',
        rate_type: 'daily',
        amount: -100.00, // Negative amount
        currency: 'USD',
        effective_date: '2026-01-01',
        end_date: '2026-12-31'
      };

      const response = await request(app)
        .post('/api/rates')
        .send(invalidRate)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/rates/room-type/:roomTypeId', () => {
    it('should return rates for a specific room type', async () => {
      const response = await request(app)
        .get('/api/rates/room-type/rt_hot_desk_dt')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rates.length).toBeGreaterThan(0);
      response.body.data.rates.forEach(rate => {
        expect(rate.room_type_id).toBe('rt_hot_desk_dt');
      });
    });

    it('should filter rates by date', async () => {
      const response = await request(app)
        .get('/api/rates/room-type/rt_exec_office_dt?date=2025-02-15')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should only return rates that include Feb 15, 2025
      response.body.data.rates.forEach(rate => {
        const effectiveDate = new Date(rate.effective_date);
        const endDate = new Date(rate.end_date);
        const targetDate = new Date('2025-02-15');
        expect(targetDate >= effectiveDate && targetDate <= endDate).toBe(true);
      });
    });

    // BUG: This test expects invalid dates to be silently ignored, but PRD says they should return errors
    it('should ignore invalid date format', async () => {
      const response = await request(app)
        .get('/api/rates/room-type/rt_exec_office_dt?date=not-a-date')
        .expect(200); // Should actually validate and return 400

      expect(response.body.success).toBe(true);
    });

    it('should return empty array for room type with no rates', async () => {
      const response = await request(app)
        .get('/api/rates/room-type/nonexistent_room_type')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rates).toEqual([]);
    });
  });

  describe('PUT /api/rates/:id', () => {
    it('should update an existing rate', async () => {
      const updates = {
        amount: 160.00
      };

      const response = await request(app)
        .put('/api/rates/rate_exec_dt_daily_q1')
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(160);
    });

    it('should return 404 for non-existent rate', async () => {
      const response = await request(app)
        .put('/api/rates/nonexistent_id')
        .send({ amount: 150.00 })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/rates/:id', () => {
    it('should delete an existing rate', async () => {
      const response = await request(app)
        .delete('/api/rates/rate_exec_dt_monthly_q1')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify it's deleted
      const getResponse = await request(app)
        .get('/api/rates/rate_exec_dt_monthly_q1')
        .expect(404);
    });

    it('should return 404 for non-existent rate', async () => {
      const response = await request(app)
        .delete('/api/rates/nonexistent_id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/rates/sync', () => {
    it('should sync rates from external source', async () => {
      const response = await request(app)
        .post('/api/rates/sync')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results.imported).toBeGreaterThanOrEqual(0);
    });

    // BUG: This test expects sync to work even with missing external file,
    // but PRD says sync should fail gracefully with clear error
    it('should succeed even if external file is missing', async () => {
      // This test would require mocking file system to actually test
      // But the expectation is wrong - sync should fail if file is missing
      expect(true).toBe(true); // Placeholder
    });
  });
});

// BUG: Missing test coverage for important scenarios per PRD:
// - Testing rate lookup for date ranges spanning multiple rate periods
// - Testing that external sync preserves local changes (or overwrites them)
// - Testing concurrent rate updates (file-based DB race conditions)
// - Testing rate deletion impact on bookings
