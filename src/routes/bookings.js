const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');
const { validateBooking, createValidationError } = require('../utils/validation');

/**
 * GET /api/bookings
 * List all bookings
 */
router.get('/', async (req, res, next) => {
  try {
    const { unit_id, status } = req.query;

    let bookings;
    if (unit_id || status) {
      const filter = {};
      if (unit_id) filter.unit_id = unit_id;
      if (status) filter.status = status;
      bookings = await db.find('bookings', filter);
    } else {
      bookings = await db.findAll('bookings');
    }

    res.json({
      success: true,
      data: {
        bookings,
        count: bookings.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bookings/:id
 * Get a specific booking by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const booking = await db.findById('bookings', req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Booking not found',
          code: 'BOOKING_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/bookings/calculate-price
 * Calculate price for a booking without creating it
 *
 * FEATURE REQUEST: Implement the booking price calculation engine
 *
 * Given a unit_id and date range (start_date, end_date), calculate the total
 * booking price using the room type's rate configuration.
 *
 * CORE REQUIREMENTS:
 * 1. Look up the unit and get its room_type_id
 * 2. Find rates for that room type that apply to the booking period
 * 3. Calculate the total price based on the booking duration
 * 4. Return a breakdown showing how the price was calculated
 * 5. Handle errors gracefully (unit not found, missing rates, etc.)
 *
 * YOUR IMPLEMENTATION WILL ENCOUNTER:
 * - Simple bookings (single rate period) ✅ Everyone should handle this
 * - Multi-period bookings (rates change mid-booking) 🔶 Expected
 * - Rate gaps (no rate configured for some dates) 🔶 Expected
 * - Multiple rate types (hourly vs daily vs monthly) 🔷 Advanced
 * - Rate overlaps (data quality issues) 🔴 Advanced
 * - Minimum stay requirements (see room_type.pricing_config) 🟣 Expert
 * - Length-of-stay discounts (see room_type.pricing_config) 🟢 Expert
 *
 * HINTS:
 * - Start simple: get single-period bookings working first
 * - The seed data has intentional complexity - test with different date ranges!
 * - Room types have a `pricing_config` object with business rules
 * - Consider how you'd extend this for future requirements (weekend pricing, etc.)
 * - Think about separation of concerns - calculation vs. API layer
 *
 * EXAMPLE REQUEST:
 * {
 *   "unit_id": "unit_exec_dt_101",
 *   "start_date": "2025-01-15",
 *   "end_date": "2025-01-20"
 * }
 *
 * EXAMPLE RESPONSE:
 * {
 *   "success": true,
 *   "data": {
 *     "total_price": 750.00,
 *     "currency": "USD",
 *     "booking_details": {
 *       "unit_id": "unit_exec_dt_101",
 *       "room_type": "Executive Office",
 *       "start_date": "2025-01-15",
 *       "end_date": "2025-01-20",
 *       "total_nights": 5
 *     },
 *     "breakdown": [
 *       {
 *         "period_start": "2025-01-15",
 *         "period_end": "2025-01-20",
 *         "days": 5,
 *         "rate_type": "daily",
 *         "rate_amount": 150.00,
 *         "subtotal": 750.00
 *       }
 *     ]
 *   }
 * }
 *
 * See PRD.md FR-4 for detailed business rules and edge cases.
 */
router.post('/calculate-price', async (req, res, next) => {
  try {
    const { unit_id, start_date, end_date } = req.body;

    // TODO: Your implementation here
    // Suggested approach:
    // 1. Validate inputs (required fields, date format, start < end)
    // 2. Look up unit and room type
    // 3. Find applicable rates
    // 4. Calculate price (handle multi-period, rate gaps, etc.)
    // 5. Apply any discounts or premiums (advanced)
    // 6. Return structured response

    res.status(501).json({
      success: false,
      error: {
        message: 'Price calculation not implemented',
        code: 'NOT_IMPLEMENTED',
        details: {
          hint: 'Implement this feature progressively. Start with single-period bookings, then handle complexity.'
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/bookings
 * Create a new booking with price calculation
 *
 * TODO: CANDIDATE MUST IMPLEMENT PRICE CALCULATION
 *
 * Requirements:
 * 1. Validate booking data
 * 2. Check unit availability
 * 3. Calculate price using the same logic as /calculate-price
 * 4. Create booking with calculated price
 * 5. Update unit status if needed
 * 6. Return created booking
 */
router.post('/', async (req, res, next) => {
  try {
    const bookingData = req.body;

    // Validate input
    const validation = validateBooking(bookingData);
    if (!validation.valid) {
      throw createValidationError(validation.errors);
    }

    // Check if unit exists
    const unit = await db.findById('units', bookingData.unit_id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Unit not found',
          code: 'UNIT_NOT_FOUND'
        }
      });
    }

    // Check unit availability
    if (unit.status !== 'available') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Unit is not available for booking',
          code: 'UNIT_NOT_AVAILABLE',
          details: {
            current_status: unit.status
          }
        }
      });
    }

    // TODO: IMPLEMENT PRICE CALCULATION HERE
    // This is the core logic candidates need to implement
    // Should:
    // 1. Get room type from unit
    // 2. Find applicable rates
    // 3. Calculate total price
    // 4. Handle missing rates

    const calculated_price = 0; // PLACEHOLDER - candidates must implement

    // Create booking
    const booking = {
      booking_id: `book_${uuidv4()}`,
      ...bookingData,
      calculated_price,
      currency: 'USD', // Should come from rate
      status: 'pending'
    };

    await db.insert('bookings', booking);

    // TODO: Consider updating unit status to 'reserved' or 'occupied'

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/bookings/:id
 * Update an existing booking
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if booking exists
    const existingBooking = await db.findById('bookings', id);
    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Booking not found',
          code: 'BOOKING_NOT_FOUND'
        }
      });
    }

    // If dates change, recalculate price
    if (updates.start_date || updates.end_date) {
      // TODO: Recalculate price with new dates
      // For now, just update the booking
    }

    const result = await db.update('bookings', id, updates);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/bookings/:id
 * Cancel a booking
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await db.findById('bookings', id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Booking not found',
          code: 'BOOKING_NOT_FOUND'
        }
      });
    }

    // Soft delete by updating status
    await db.update('bookings', id, { status: 'cancelled' });

    // TODO: Update unit status back to 'available'

    res.json({
      success: true,
      data: {
        message: 'Booking cancelled successfully',
        booking_id: id
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
