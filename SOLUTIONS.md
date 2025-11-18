# Solutions Guide

This document contains complete solutions for all interview tasks. **DO NOT share with candidates.**

---

## Solution 1: Price Calculation Endpoint

### File: `src/routes/bookings.js`

### Complete Implementation

```javascript
/**
 * POST /api/bookings/calculate-price
 * Calculate price for a booking without creating it
 */
router.post('/calculate-price', async (req, res, next) => {
  try {
    const { unit_id, start_date, end_date } = req.body;

    // Step 1: Validate required fields
    if (!unit_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'unit_id, start_date, and end_date are required',
          code: 'MISSING_REQUIRED_FIELDS',
          details: {
            received: { unit_id, start_date, end_date }
          }
        }
      });
    }

    // Step 2: Validate date format and order
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid date format. Use YYYY-MM-DD',
          code: 'INVALID_DATE_FORMAT',
          details: {
            start_date,
            end_date
          }
        }
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'start_date must be before end_date',
          code: 'INVALID_DATE_RANGE',
          details: {
            start_date,
            end_date
          }
        }
      });
    }

    // Step 3: Find unit
    const unit = await db.findById('units', unit_id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Unit not found',
          code: 'UNIT_NOT_FOUND',
          details: { unit_id }
        }
      });
    }

    // Step 4: Find room type
    const roomType = await db.findById('room_types', unit.room_type_id);
    if (!roomType) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Room type not found for unit',
          code: 'ROOM_TYPE_NOT_FOUND',
          details: {
            unit_id,
            room_type_id: unit.room_type_id
          }
        }
      });
    }

    // Step 5: Find applicable rates (daily rate type for simplicity)
    const allRates = await db.find('rates', {
      room_type_id: unit.room_type_id,
      rate_type: 'daily'
    });

    // Step 6: Filter rates that overlap with booking period
    const applicableRates = allRates.filter(rate => {
      const rateStart = new Date(rate.effective_date);
      const rateEnd = new Date(rate.end_date);

      // Check if rate period overlaps with booking period
      // Overlap exists if: rateStart <= bookingEnd AND rateEnd >= bookingStart
      return (rateStart <= endDate && rateEnd >= startDate);
    });

    if (applicableRates.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No daily rates available for the requested booking period',
          code: 'NO_RATES_AVAILABLE',
          details: {
            room_type_id: unit.room_type_id,
            room_type_name: roomType.name,
            start_date,
            end_date,
            suggestion: 'Check data/rates.json for available rate periods'
          }
        }
      });
    }

    // Step 7: Calculate price day-by-day
    let totalPrice = 0;
    const breakdown = [];
    let currentDate = new Date(startDate);

    while (currentDate < endDate) {
      // Find applicable rate for current date
      const rate = applicableRates.find(r => {
        const rateStart = new Date(r.effective_date);
        const rateEnd = new Date(r.end_date);
        return currentDate >= rateStart && currentDate <= rateEnd;
      });

      if (!rate) {
        // Rate gap found
        return res.status(400).json({
          success: false,
          error: {
            message: `No rate available for date ${currentDate.toISOString().split('T')[0]}`,
            code: 'RATE_GAP',
            details: {
              missing_date: currentDate.toISOString().split('T')[0],
              room_type_id: unit.room_type_id,
              room_type_name: roomType.name
            }
          }
        });
      }

      // Add one day's charge
      totalPrice += rate.amount;

      // Track in breakdown
      const existingPeriod = breakdown.find(b => b.rate_id === rate.rate_id);
      if (existingPeriod) {
        existingPeriod.days++;
        existingPeriod.subtotal += rate.amount;
      } else {
        breakdown.push({
          rate_id: rate.rate_id,
          rate_amount: rate.amount,
          currency: rate.currency,
          effective_date: rate.effective_date,
          end_date: rate.end_date,
          days: 1,
          subtotal: rate.amount
        });
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Step 8: Return calculated price with breakdown
    res.json({
      success: true,
      data: {
        unit_id,
        room_type_id: unit.room_type_id,
        room_type_name: roomType.name,
        start_date,
        end_date,
        total_days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
        calculated_price: totalPrice,
        currency: applicableRates[0].currency,
        breakdown
      }
    });

  } catch (error) {
    next(error);
  }
});
```

### Key Points

**Algorithm:**
1. Validate inputs (required fields, date format, date order)
2. Find unit by ID
3. Get room type from unit
4. Query rates for room type (filter by rate_type='daily')
5. Filter rates that overlap with booking period
6. Iterate day-by-day through booking period
7. For each day, find applicable rate
8. Handle gaps (no rate for a specific date)
9. Calculate total and build breakdown

**Edge Cases Handled:**
- Missing required fields
- Invalid date format
- Start date after end date
- Non-existent unit
- Non-existent room type
- No rates for room type
- Rate gaps (some days covered, others not)
- Multiple rate periods in one booking

---

## Solution 2: Booking Creation with Price Calculation

### File: `src/routes/bookings.js`

### Updated POST /api/bookings

```javascript
/**
 * POST /api/bookings
 * Create a new booking with price calculation
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

    // PRICE CALCULATION LOGIC
    // Get room type
    const roomType = await db.findById('room_types', unit.room_type_id);
    if (!roomType) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Room type not found for unit',
          code: 'ROOM_TYPE_NOT_FOUND'
        }
      });
    }

    // Get rates for room type
    const allRates = await db.find('rates', {
      room_type_id: unit.room_type_id,
      rate_type: 'daily'
    });

    const startDate = new Date(bookingData.start_date);
    const endDate = new Date(bookingData.end_date);

    // Filter applicable rates
    const applicableRates = allRates.filter(rate => {
      const rateStart = new Date(rate.effective_date);
      const rateEnd = new Date(rate.end_date);
      return (rateStart <= endDate && rateEnd >= startDate);
    });

    if (applicableRates.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot create booking: No rates available for the requested period',
          code: 'NO_RATES_AVAILABLE',
          details: {
            room_type_id: unit.room_type_id,
            room_type_name: roomType.name,
            start_date: bookingData.start_date,
            end_date: bookingData.end_date
          }
        }
      });
    }

    // Calculate total price day-by-day
    let calculated_price = 0;
    let currentDate = new Date(startDate);

    while (currentDate < endDate) {
      const rate = applicableRates.find(r => {
        const rateStart = new Date(r.effective_date);
        const rateEnd = new Date(r.end_date);
        return currentDate >= rateStart && currentDate <= rateEnd;
      });

      if (!rate) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Cannot create booking: Rate gap on ${currentDate.toISOString().split('T')[0]}`,
            code: 'RATE_GAP',
            details: {
              missing_date: currentDate.toISOString().split('T')[0]
            }
          }
        });
      }

      calculated_price += rate.amount;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create booking with calculated price
    const booking = {
      booking_id: `book_${uuidv4()}`,
      ...bookingData,
      calculated_price,
      currency: applicableRates[0].currency,
      status: 'pending'
    };

    await db.insert('bookings', booking);

    // Optional: Update unit status to 'reserved'
    // await db.update('units', bookingData.unit_id, { status: 'reserved' });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
});
```

### Improvement: Extract to Shared Utility

**Better approach:** Extract price calculation to a shared function

Create `src/utils/priceCalculator.js`:

```javascript
const db = require('../db/db');

/**
 * Calculate booking price
 * @param {string} unit_id
 * @param {string} start_date - ISO format (YYYY-MM-DD)
 * @param {string} end_date - ISO format (YYYY-MM-DD)
 * @returns {Promise<Object>} { price, currency, breakdown }
 */
async function calculateBookingPrice(unit_id, start_date, end_date) {
  // Validate dates
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid date format');
  }

  if (startDate >= endDate) {
    throw new Error('start_date must be before end_date');
  }

  // Find unit
  const unit = await db.findById('units', unit_id);
  if (!unit) {
    const error = new Error('Unit not found');
    error.statusCode = 404;
    error.code = 'UNIT_NOT_FOUND';
    throw error;
  }

  // Find room type
  const roomType = await db.findById('room_types', unit.room_type_id);
  if (!roomType) {
    const error = new Error('Room type not found');
    error.statusCode = 500;
    error.code = 'ROOM_TYPE_NOT_FOUND';
    throw error;
  }

  // Get applicable rates
  const allRates = await db.find('rates', {
    room_type_id: unit.room_type_id,
    rate_type: 'daily'
  });

  const applicableRates = allRates.filter(rate => {
    const rateStart = new Date(rate.effective_date);
    const rateEnd = new Date(rate.end_date);
    return (rateStart <= endDate && rateEnd >= startDate);
  });

  if (applicableRates.length === 0) {
    const error = new Error('No rates available for booking period');
    error.statusCode = 400;
    error.code = 'NO_RATES_AVAILABLE';
    error.details = {
      room_type_id: unit.room_type_id,
      room_type_name: roomType.name,
      start_date,
      end_date
    };
    throw error;
  }

  // Calculate price
  let totalPrice = 0;
  const breakdown = [];
  let currentDate = new Date(startDate);

  while (currentDate < endDate) {
    const rate = applicableRates.find(r => {
      const rateStart = new Date(r.effective_date);
      const rateEnd = new Date(r.end_date);
      return currentDate >= rateStart && currentDate <= rateEnd;
    });

    if (!rate) {
      const error = new Error(`Rate gap on ${currentDate.toISOString().split('T')[0]}`);
      error.statusCode = 400;
      error.code = 'RATE_GAP';
      error.details = {
        missing_date: currentDate.toISOString().split('T')[0]
      };
      throw error;
    }

    totalPrice += rate.amount;

    const existingPeriod = breakdown.find(b => b.rate_id === rate.rate_id);
    if (existingPeriod) {
      existingPeriod.days++;
      existingPeriod.subtotal += rate.amount;
    } else {
      breakdown.push({
        rate_id: rate.rate_id,
        rate_amount: rate.amount,
        currency: rate.currency,
        effective_date: rate.effective_date,
        end_date: rate.end_date,
        days: 1,
        subtotal: rate.amount
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    price: totalPrice,
    currency: applicableRates[0].currency,
    breakdown,
    room_type_name: roomType.name,
    room_type_id: unit.room_type_id,
    total_days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  };
}

module.exports = { calculateBookingPrice };
```

Then use it in both endpoints:

```javascript
const { calculateBookingPrice } = require('../utils/priceCalculator');

// In /calculate-price endpoint:
router.post('/calculate-price', async (req, res, next) => {
  try {
    const { unit_id, start_date, end_date } = req.body;

    const result = await calculateBookingPrice(unit_id, start_date, end_date);

    res.json({
      success: true,
      data: {
        unit_id,
        ...result,
        start_date,
        end_date
      }
    });
  } catch (error) {
    next(error);
  }
});

// In POST /bookings:
const result = await calculateBookingPrice(
  bookingData.unit_id,
  bookingData.start_date,
  bookingData.end_date
);

const booking = {
  booking_id: `book_${uuidv4()}`,
  ...bookingData,
  calculated_price: result.price,
  currency: result.currency,
  status: 'pending'
};
```

---

## Solution 3: Properties CRUD - POST Endpoint

### File: `src/routes/properties.js`

```javascript
router.post('/', async (req, res, next) => {
  try {
    const propertyData = req.body;

    // Validate input using validateProperty
    const validation = validateProperty(propertyData);
    if (!validation.valid) {
      throw createValidationError(validation.errors);
    }

    // Generate property_id
    const property = {
      property_id: `prop_${uuidv4()}`,
      ...propertyData,
      status: propertyData.status || 'active' // Default to active
    };

    // Insert into database
    await db.insert('properties', property);

    // Return created property
    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
});
```

### Additional CRUD Operations (Optional Bonus)

**PUT - Update Property:**

```javascript
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if property exists
    const existingProperty = await db.findById('properties', id);
    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Property not found',
          code: 'PROPERTY_NOT_FOUND'
        }
      });
    }

    // Validate updated data
    const updatedProperty = { ...existingProperty, ...updates };
    const validation = validateProperty(updatedProperty);
    if (!validation.valid) {
      throw createValidationError(validation.errors);
    }

    // Update in database
    const result = await db.update('properties', id, updates);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});
```

**DELETE - Delete Property:**

```javascript
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if property exists
    const property = await db.findById('properties', id);
    if (!property) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Property not found',
          code: 'PROPERTY_NOT_FOUND'
        }
      });
    }

    // Check if property has room types (referential integrity)
    const roomTypes = await db.find('room_types', { property_id: id });
    if (roomTypes.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete property with existing room types',
          code: 'HAS_DEPENDENCIES',
          details: {
            room_types_count: roomTypes.length
          }
        }
      });
    }

    // Delete from database
    await db.delete('properties', id);

    res.json({
      success: true,
      data: {
        message: 'Property deleted successfully',
        property_id: id
      }
    });
  } catch (error) {
    next(error);
  }
});
```

---

## Bug Fixes

### Bug Fix 1: Rate Overlap Validation

**File:** `src/routes/rates.js`

**Location:** POST and PUT endpoints (lines 70, 105)

**Problem:** Allows creating overlapping rate periods for the same room type

**Solution:**

```javascript
// Add this helper function at the top of rates.js
async function checkRateOverlap(rateData, excludeRateId = null) {
  // Get existing rates for the same room type and rate type
  const existingRates = await db.find('rates', {
    room_type_id: rateData.room_type_id,
    rate_type: rateData.rate_type
  });

  const newStart = new Date(rateData.effective_date);
  const newEnd = new Date(rateData.end_date);

  for (const existing of existingRates) {
    // Skip if this is the same rate (for updates)
    if (excludeRateId && existing.rate_id === excludeRateId) {
      continue;
    }

    const existingStart = new Date(existing.effective_date);
    const existingEnd = new Date(existing.end_date);

    // Check for overlap: newStart <= existingEnd AND newEnd >= existingStart
    if (newStart <= existingEnd && newEnd >= existingStart) {
      return {
        hasOverlap: true,
        conflictingRate: existing
      };
    }
  }

  return { hasOverlap: false };
}

// In POST endpoint, before insert:
const overlapCheck = await checkRateOverlap(rateData);
if (overlapCheck.hasOverlap) {
  return res.status(400).json({
    success: false,
    error: {
      message: 'Rate date range overlaps with existing rate',
      code: 'RATE_OVERLAP',
      details: {
        conflicting_rate: overlapCheck.conflictingRate
      }
    }
  });
}

// In PUT endpoint, before update:
const overlapCheck = await checkRateOverlap(updatedRate, id);
if (overlapCheck.hasOverlap) {
  return res.status(400).json({
    success: false,
    error: {
      message: 'Updated rate would overlap with existing rate',
      code: 'RATE_OVERLAP',
      details: {
        conflicting_rate: overlapCheck.conflictingRate
      }
    }
  });
}
```

---

### Bug Fix 2: Missing Error Handling in Sync

**File:** `src/routes/rates.js`

**Location:** POST /api/rates/sync (line 158)

**Problem:** No try-catch around file read - crashes if file missing or malformed

**Solution:**

```javascript
router.post('/sync', async (req, res, next) => {
  try {
    const externalFilePath = path.join(__dirname, '../../data/external_rates.json');

    let externalRates;
    try {
      const fileContent = await fs.readFile(externalFilePath, 'utf-8');
      externalRates = JSON.parse(fileContent);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          success: false,
          error: {
            message: 'External rates file not found',
            code: 'SYNC_FILE_NOT_FOUND',
            details: {
              file_path: externalFilePath
            }
          }
        });
      }

      if (error instanceof SyntaxError) {
        return res.status(500).json({
          success: false,
          error: {
            message: 'External rates file contains invalid JSON',
            code: 'SYNC_FILE_INVALID',
            details: {
              parse_error: error.message
            }
          }
        });
      }

      throw error; // Re-throw other errors
    }

    // Validate that externalRates is an array
    if (!Array.isArray(externalRates)) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'External rates file must contain an array',
          code: 'SYNC_FILE_INVALID_FORMAT'
        }
      });
    }

    // Rest of sync logic...
    const syncResults = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    for (const externalRate of externalRates) {
      try {
        // Existing sync logic...
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
```

---

### Bug Fix 3: Invalid Date Validation

**File:** `src/routes/rates.js`

**Location:** GET /api/rates/room-type/:roomTypeId (line 51)

**Problem:** Date query parameter not validated before use

**Solution:**

```javascript
router.get('/room-type/:roomTypeId', async (req, res, next) => {
  try {
    const { roomTypeId } = req.params;
    const { date } = req.query;

    let rates = await db.find('rates', { room_type_id: roomTypeId });

    // Filter by date if provided
    if (date) {
      // Validate date format
      const targetDate = new Date(date);

      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid date format. Use YYYY-MM-DD',
            code: 'INVALID_DATE_FORMAT',
            details: {
              provided_date: date
            }
          }
        });
      }

      rates = rates.filter(rate => {
        const effectiveDate = new Date(rate.effective_date);
        const endDate = new Date(rate.end_date);
        return targetDate >= effectiveDate && targetDate <= endDate;
      });
    }

    res.json({
      success: true,
      data: {
        room_type_id: roomTypeId,
        rates,
        count: rates.length,
        ...(date && { filtered_by_date: date })
      }
    });
  } catch (error) {
    next(error);
  }
});
```

---

### Bug Fix 4: Currency Validation

**File:** `src/utils/validation.js`

**Location:** validateRate function (line 23)

**Problem:** Accepts any string for currency, should validate ISO codes

**Solution:**

```javascript
// Add at top of file
const VALID_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF'];

function validateRate(rate) {
  const errors = [];

  if (!rate.room_type_id) {
    errors.push('room_type_id is required');
  }

  if (!rate.rate_type) {
    errors.push('rate_type is required');
  } else if (!['hourly', 'daily', 'monthly'].includes(rate.rate_type)) {
    errors.push('rate_type must be one of: hourly, daily, monthly');
  }

  if (rate.amount === undefined || rate.amount === null) {
    errors.push('amount is required');
  } else if (typeof rate.amount !== 'number' || rate.amount <= 0) {
    errors.push('amount must be a positive number');
  }

  // FIXED: Proper currency validation
  if (!rate.currency) {
    errors.push('currency is required');
  } else if (!VALID_CURRENCIES.includes(rate.currency)) {
    errors.push(`currency must be one of: ${VALID_CURRENCIES.join(', ')}`);
  }

  // Rest of validation...
}
```

---

## Test Fixes

### Buggy Tests to Fix

**File:** `tests/rates.test.js`

**Test 1:** Line 47 - Invalid currency should be rejected

```javascript
// BEFORE (buggy):
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

// AFTER (fixed):
it('should reject invalid currency code', async () => {
  const newRate = {
    room_type_id: 'rt_exec_office_dt',
    rate_type: 'daily',
    amount: 200.00,
    currency: 'INVALID_CURRENCY',
    effective_date: '2026-01-01',
    end_date: '2026-12-31'
  };

  const response = await request(app)
    .post('/api/rates')
    .send(newRate)
    .expect(400); // Should reject

  expect(response.body.success).toBe(false);
  expect(response.body.error.code).toBe('VALIDATION_ERROR');
});
```

---

**Test 2:** Line 77 - Overlapping rates should be rejected

```javascript
// AFTER (fixed):
it('should reject creating overlapping rate periods', async () => {
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
    .expect(400); // Should reject per PRD

  expect(response.body.success).toBe(false);
  expect(response.body.error.code).toBe('RATE_OVERLAP');
});
```

---

**File:** `tests/bookings.test.js`

**Test 3:** Line 38 - Use daily rates for multi-day bookings

```javascript
// AFTER (fixed):
it('should use daily rates for multi-day bookings', async () => {
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
  // Should use daily rate ($50), not hourly
  expect(response.body.data.calculated_price).toBe(50 * 4); // $200
});
```

---

**Test 4:** Line 69 - Missing rates should return error

```javascript
// AFTER (fixed):
it('should return error when rates are missing', async () => {
  const priceRequest = {
    unit_id: 'unit_dt_meet_001', // Meeting room with NO rates
    start_date: '2025-02-01',
    end_date: '2025-02-10'
  };

  const response = await request(app)
    .post('/api/bookings/calculate-price')
    .send(priceRequest)
    .expect(400); // Should fail per PRD

  expect(response.body.success).toBe(false);
  expect(response.body.error.code).toBe('NO_RATES_AVAILABLE');
});
```

---

## Expected Interview Outcomes

### Exceptional Candidate (90-100 points)
- Implements price calculation with all edge cases handled
- Code is clean, well-structured, production-ready
- Tests implementation thoroughly
- Finds all or most intentional bugs with AI
- Critically evaluates AI suggestions
- Identifies most buggy tests
- Completes in ~100 minutes with time for stretch goals

### Good Candidate (70-89 points)
- Implements working price calculation with some edge cases
- Code works but may have minor issues
- Tests basic scenarios
- Finds major bugs with AI
- Some critical evaluation of AI
- Identifies some buggy tests
- Completes core tasks in ~120 minutes

### Borderline Candidate (55-69 points)
- Implements basic price calculation, happy path only
- Code works but lacks error handling
- Limited testing
- Finds 1-2 bugs with AI
- Accepts AI suggestions without question
- Doesn't review tests or finds issues
- Struggles to complete in time

---

**This document should remain CONFIDENTIAL and only shared with interview panel members.**
