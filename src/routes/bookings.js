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
 * TODO: CANDIDATE MUST IMPLEMENT THIS
 *
 * Requirements:
 * 1. Accept unit_id, start_date, end_date in request body
 * 2. Find the unit and its room type
 * 3. Find applicable rates for the room type and date range
 * 4. Calculate total price based on the booking duration
 * 5. Handle cases where:
 *    - No rates exist for the date range
 *    - Rates span multiple periods
 *    - Different rate types (hourly, daily, monthly)
 * 6. Return calculated price and breakdown
 */
router.post('/calculate-price', async (req, res, next) => {
  try {
    const { unit_id, start_date, end_date } = req.body;

    // TODO: Validate required fields
    // TODO: Find unit
    // TODO: Find room type from unit
    // TODO: Find applicable rates
    // TODO: Calculate price based on duration and rates
    // TODO: Handle missing rates gracefully
    // TODO: Return price breakdown

    res.status(501).json({
      success: false,
      error: {
        message: 'Price calculation not implemented',
        code: 'NOT_IMPLEMENTED',
        details: {
          hint: 'This is a key feature for candidates to implement. See PRD.md for business rules.'
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
