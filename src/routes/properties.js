const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');
const { validateProperty, createValidationError } = require('../utils/validation');

/**
 * GET /api/properties
 * List all properties
 */
router.get('/', async (req, res, next) => {
  try {
    const properties = await db.findAll('properties');

    res.json({
      success: true,
      data: {
        properties,
        count: properties.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/properties/:id
 * Get a specific property by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const property = await db.findById('properties', req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Property not found',
          code: 'PROPERTY_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/properties
 * Create a new property
 *
 * TODO: Implement property creation
 */
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate input using validateProperty
    // TODO: Generate property_id
    // TODO: Insert into database
    // TODO: Return created property

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
 * PUT /api/properties/:id
 * Update an existing property
 *
 * TODO: Implement property update
 */
router.put('/:id', async (req, res, next) => {
  try {
    // TODO: Check if property exists
    // TODO: Validate updates
    // TODO: Update in database
    // TODO: Return updated property

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
 * DELETE /api/properties/:id
 * Delete a property
 *
 * TODO: Implement property deletion with referential integrity check
 */
router.delete('/:id', async (req, res, next) => {
  try {
    // TODO: Check if property exists
    // TODO: Check if property has room types (should prevent deletion if it does)
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
