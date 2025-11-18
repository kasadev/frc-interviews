const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');
const { validateUnit, createValidationError } = require('../utils/validation');

/**
 * GET /api/units
 * List all units
 */
router.get('/', async (req, res, next) => {
  try {
    const { room_type_id, status } = req.query;

    let units;
    if (room_type_id || status) {
      const filter = {};
      if (room_type_id) filter.room_type_id = room_type_id;
      if (status) filter.status = status;
      units = await db.find('units', filter);
    } else {
      units = await db.findAll('units');
    }

    res.json({
      success: true,
      data: {
        units,
        count: units.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/units/:id
 * Get a specific unit by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const unit = await db.findById('units', req.params.id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Unit not found',
          code: 'UNIT_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: unit
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/units
 * Create a new unit
 *
 * TODO: Implement unit creation
 */
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate input using validateUnit
    // TODO: Verify that room_type_id exists
    // TODO: Generate unit_id
    // TODO: Insert into database
    // TODO: Return created unit

    res.status(501).json({
      success: false,
      error: {
        message: 'Not implemented',
        code: 'NOT_IMPLEMENTED'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/units/:id
 * Update an existing unit
 *
 * TODO: Implement unit update
 */
router.put('/:id', async (req, res, next) => {
  try {
    // TODO: Check if unit exists
    // TODO: Validate updates
    // TODO: Update in database
    // TODO: Return updated unit

    res.status(501).json({
      success: false,
      error: {
        message: 'Not implemented',
        code: 'NOT_IMPLEMENTED'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/units/:id
 * Delete a unit
 *
 * TODO: Implement unit deletion with referential integrity check
 */
router.delete('/:id', async (req, res, next) => {
  try {
    // TODO: Check if unit exists
    // TODO: Check if unit has active bookings (should prevent deletion if it does)
    // TODO: Delete from database
    // TODO: Return success message

    res.status(501).json({
      success: false,
      error: {
        message: 'Not implemented',
        code: 'NOT_IMPLEMENTED'
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
