const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');
const { validateRate, createValidationError } = require('../utils/validation');
const fs = require('fs').promises;
const path = require('path');

/**
 * GET /api/rates
 * List all rates with optional filtering
 */
router.get('/', async (req, res, next) => {
  try {
    const { room_type_id, rate_type } = req.query;

    let rates;
    if (room_type_id || rate_type) {
      const filter = {};
      if (room_type_id) filter.room_type_id = room_type_id;
      if (rate_type) filter.rate_type = rate_type;

      rates = await db.find('rates', filter);
    } else {
      // BUG: Inefficient - loads all rates into memory
      rates = await db.findAll('rates');
    }

    res.json({
      success: true,
      data: {
        rates,
        count: rates.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/rates/:id
 * Get a specific rate by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const rate = await db.findById('rates', req.params.id);

    if (!rate) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Rate not found',
          code: 'RATE_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: rate
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/rates/room-type/:roomTypeId
 * Get rates for a specific room type, optionally filtered by date
 */
router.get('/room-type/:roomTypeId', async (req, res, next) => {
  try {
    const { roomTypeId } = req.params;
    const { date } = req.query;

    let rates = await db.find('rates', { room_type_id: roomTypeId });

    // Filter by date if provided
    if (date) {
      const targetDate = new Date(date);
      rates = rates.filter(rate => {
        const effectiveDate = new Date(rate.effective_date);
        const endDate = new Date(rate.end_date);

        // BUG: Missing validation - what if date is invalid?
        return targetDate >= effectiveDate && targetDate <= endDate;
      });
    }

    res.json({
      success: true,
      data: {
        room_type_id: roomTypeId,
        rates,
        count: rates.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/rates
 * Create a new rate
 */
router.post('/', async (req, res, next) => {
  try {
    const rateData = req.body;

    // Validate input
    const validation = validateRate(rateData);
    if (!validation.valid) {
      throw createValidationError(validation.errors);
    }

    // BUG: Missing overlap detection! This should check if the new rate
    // overlaps with existing rates for the same room type

    // Generate ID
    const rate = {
      rate_id: `rate_${uuidv4()}`,
      ...rateData
    };

    await db.insert('rates', rate);

    res.status(201).json({
      success: true,
      data: rate
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/rates/:id
 * Update an existing rate
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if rate exists
    const existingRate = await db.findById('rates', id);
    if (!existingRate) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Rate not found',
          code: 'RATE_NOT_FOUND'
        }
      });
    }

    // Validate updated data
    const updatedRate = { ...existingRate, ...updates };
    const validation = validateRate(updatedRate);
    if (!validation.valid) {
      throw createValidationError(validation.errors);
    }

    // BUG: Missing overlap detection on update as well!

    const result = await db.update('rates', id, updates);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/rates/:id
 * Delete a rate
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await db.delete('rates', id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Rate not found',
          code: 'RATE_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Rate deleted successfully',
        rate_id: id
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/rates/sync
 * Sync rates from external system (mock)
 */
router.post('/sync', async (req, res, next) => {
  try {
    // Read from mock external file
    const externalFilePath = path.join(__dirname, '../../data/external_rates.json');

    // BUG: No error handling! What if the file doesn't exist or is malformed?
    const fileContent = await fs.readFile(externalFilePath, 'utf-8');
    const externalRates = JSON.parse(fileContent);

    const syncResults = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    for (const externalRate of externalRates) {
      try {
        // Check if rate already exists for this room type and date range
        const existingRates = await db.find('rates', {
          room_type_id: externalRate.room_type_id,
          rate_type: externalRate.rate_type
        });

        // Simple conflict resolution: if exact match on dates exists, update it
        const matchingRate = existingRates.find(r =>
          r.effective_date === externalRate.effective_date &&
          r.end_date === externalRate.end_date
        );

        if (matchingRate) {
          // Update existing rate
          await db.update('rates', matchingRate.rate_id, {
            amount: externalRate.amount,
            currency: externalRate.currency
          });
          syncResults.updated++;
        } else {
          // Create new rate
          const newRate = {
            rate_id: `rate_${uuidv4()}`,
            ...externalRate
          };
          await db.insert('rates', newRate);
          syncResults.imported++;
        }
      } catch (error) {
        syncResults.errors.push({
          rate: externalRate,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        message: 'Sync completed',
        results: syncResults
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
