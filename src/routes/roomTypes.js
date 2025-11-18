const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');
const { validateRoomType, createValidationError } = require('../utils/validation');

/**
 * GET /api/room-types
 * List all room types
 */
router.get('/', async (req, res, next) => {
  try {
    const { property_id } = req.query;

    let roomTypes;
    if (property_id) {
      roomTypes = await db.find('room_types', { property_id });
    } else {
      roomTypes = await db.findAll('room_types');
    }

    res.json({
      success: true,
      data: {
        room_types: roomTypes,
        count: roomTypes.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/room-types/:id
 * Get a specific room type by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const roomType = await db.findById('room_types', req.params.id);

    if (!roomType) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Room type not found',
          code: 'ROOM_TYPE_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: roomType
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/room-types
 * Create a new room type
 *
 * TODO: Implement room type creation
 */
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate input using validateRoomType
    // TODO: Verify that property_id exists
    // TODO: Generate room_type_id
    // TODO: Insert into database
    // TODO: Return created room type

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
 * PUT /api/room-types/:id
 * Update an existing room type
 *
 * TODO: Implement room type update
 */
router.put('/:id', async (req, res, next) => {
  try {
    // TODO: Check if room type exists
    // TODO: Validate updates
    // TODO: Update in database
    // TODO: Return updated room type

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
 * DELETE /api/room-types/:id
 * Delete a room type
 *
 * TODO: Implement room type deletion with referential integrity check
 */
router.delete('/:id', async (req, res, next) => {
  try {
    // TODO: Check if room type exists
    // TODO: Check if room type has units (should prevent deletion if it does)
    // TODO: Check if room type has rates (should handle appropriately)
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
