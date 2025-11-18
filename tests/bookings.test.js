/**
 * Tests for Bookings API
 *
 * NOTE: These tests have INTENTIONAL BUGS that conflict with the PRD.
 * Candidates should identify which tests are incorrectly written.
 */

const request = require('supertest');
const app = require('../server');
const db = require('../src/db/db');

describe('Bookings API', () => {
  beforeEach(async () => {
    await db.seed();
  });

  describe('GET /api/bookings', () => {
    it('should return all bookings', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookings).toBeInstanceOf(Array);
    });

    it('should filter bookings by unit_id', async () => {
      const response = await request(app)
        .get('/api/bookings?unit_id=unit_dt_exec_003')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.bookings.forEach(booking => {
        expect(booking.unit_id).toBe('unit_dt_exec_003');
      });
    });
  });

  describe('POST /api/bookings/calculate-price', () => {
    // This test suite is for a feature that needs to be implemented by candidates

    it('should calculate price for a single-day booking', async () => {
      const priceRequest = {
        unit_id: 'unit_dt_exec_001',
        start_date: '2025-02-01',
        end_date: '2025-02-01' // Same day
      };

      const response = await request(app)
        .post('/api/bookings/calculate-price')
        .send(priceRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.calculated_price).toBe(150); // Q1 daily rate
      expect(response.body.data.currency).toBe('USD');
    });

    // BUG: This test expects hourly rates to be used for multi-day bookings,
    // but PRD says to use daily rates for multi-day bookings
    it('should use hourly rates for multi-day bookings', async () => {
      const priceRequest = {
        unit_id: 'unit_dt_desk_001', // Hot desk
        start_date: '2025-02-01',
        end_date: '2025-02-05' // 4 days
      };

      const response = await request(app)
        .post('/api/bookings/calculate-price')
        .send(priceRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      // BUG: Should use daily rate ($50), not hourly
      expect(response.body.data.calculated_price).toBe(15 * 24 * 4); // hourly * hours * days
    });

    it('should calculate price for booking spanning multiple rate periods', async () => {
      const priceRequest = {
        unit_id: 'unit_dt_exec_001',
        start_date: '2025-03-15', // In Q1 rate period
        end_date: '2025-07-15'    // Spans into H2 rate period
      };

      const response = await request(app)
        .post('/api/bookings/calculate-price')
        .send(priceRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should calculate using both Q1 and H2 rates
      expect(response.body.data.breakdown).toBeDefined();
      expect(response.body.data.breakdown.length).toBeGreaterThan(1);
    });

    // BUG: This test expects price calculation to succeed with missing rates,
    // but PRD says it should return an error
    it('should return zero price when rates are missing', async () => {
      const priceRequest = {
        unit_id: 'unit_dt_meet_001', // Meeting room with NO rates
        start_date: '2025-02-01',
        end_date: '2025-02-10'
      };

      const response = await request(app)
        .post('/api/bookings/calculate-price')
        .send(priceRequest)
        .expect(200); // Should be 400 per PRD

      expect(response.body.success).toBe(true);
      expect(response.body.data.calculated_price).toBe(0);
    });

    it('should return error for invalid date range', async () => {
      const priceRequest = {
        unit_id: 'unit_dt_exec_001',
        start_date: '2025-02-10',
        end_date: '2025-02-01' // End before start
      };

      const response = await request(app)
        .post('/api/bookings/calculate-price')
        .send(priceRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    // BUG: This test expects non-existent units to return zero price,
    // but PRD says should return 404 error
    it('should return zero price for non-existent unit', async () => {
      const priceRequest = {
        unit_id: 'nonexistent_unit',
        start_date: '2025-02-01',
        end_date: '2025-02-10'
      };

      const response = await request(app)
        .post('/api/bookings/calculate-price')
        .send(priceRequest)
        .expect(200); // Should be 404

      expect(response.body.success).toBe(true);
      expect(response.body.data.calculated_price).toBe(0);
    });
  });

  describe('POST /api/bookings', () => {
    it('should create a booking with valid data', async () => {
      const newBooking = {
        unit_id: 'unit_dt_exec_001',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        start_date: '2025-03-01',
        end_date: '2025-03-10'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(newBooking)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.booking_id).toBeDefined();
      expect(response.body.data.calculated_price).toBeGreaterThan(0);
    });

    it('should reject booking for unavailable unit', async () => {
      const newBooking = {
        unit_id: 'unit_dt_exec_003', // Status: occupied
        customer_name: 'Jane Doe',
        customer_email: 'jane@example.com',
        start_date: '2025-03-01',
        end_date: '2025-03-10'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(newBooking)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNIT_NOT_AVAILABLE');
    });

    // BUG: This test expects bookings to be created even with missing rates
    // but PRD says booking should fail if rates don't exist for the period
    it('should create booking with zero price if rates are missing', async () => {
      const newBooking = {
        unit_id: 'unit_dt_exec_001',
        customer_name: 'Test User',
        customer_email: 'test@example.com',
        start_date: '2025-05-01', // Q2 - no rates for Executive Office
        end_date: '2025-05-10'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(newBooking)
        .expect(201); // Should be 400 per PRD

      expect(response.body.success).toBe(true);
      expect(response.body.data.calculated_price).toBe(0);
    });

    it('should reject booking with invalid email', async () => {
      const newBooking = {
        unit_id: 'unit_dt_exec_001',
        customer_name: 'John Doe',
        customer_email: 'not-an-email', // Invalid
        start_date: '2025-03-01',
        end_date: '2025-03-10'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(newBooking)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/bookings/:id', () => {
    it('should update an existing booking', async () => {
      const updates = {
        customer_name: 'Updated Name'
      };

      const response = await request(app)
        .put('/api/bookings/book_001')
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customer_name).toBe('Updated Name');
    });

    // BUG: This test expects price to remain unchanged when dates change,
    // but PRD says price should be recalculated when dates change
    it('should keep original price when dates are updated', async () => {
      const updates = {
        start_date: '2025-03-01',
        end_date: '2025-03-15' // Different dates
      };

      const response = await request(app)
        .put('/api/bookings/book_001')
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      // BUG: Should recalculate price, not keep original
      expect(response.body.data.calculated_price).toBe(3500); // Original price
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('should cancel a booking', async () => {
      const response = await request(app)
        .delete('/api/bookings/book_001')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify booking status is cancelled
      const getResponse = await request(app)
        .get('/api/bookings/book_001')
        .expect(200);

      expect(getResponse.body.data.status).toBe('cancelled');
    });

    // BUG: This test expects hard delete, but PRD says use soft delete (status: cancelled)
    it('should permanently delete booking from database', async () => {
      await request(app)
        .delete('/api/bookings/book_002')
        .expect(200);

      // Should still exist but with cancelled status, not 404
      const getResponse = await request(app)
        .get('/api/bookings/book_002')
        .expect(404); // BUG: Should be 200 with status: cancelled

      expect(getResponse.body.success).toBe(false);
    });
  });
});

// MISSING TEST COVERAGE (per PRD requirements):
// - Price calculation for monthly rate type
// - Price breakdown details in response
// - Booking overlap validation (double-booking prevention)
// - Unit status update after booking creation
// - Currency consistency between rate and booking
