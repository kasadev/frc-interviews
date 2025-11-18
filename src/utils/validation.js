/**
 * Validation utilities
 */

/**
 * Validate rate data
 */
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

  // BUG: Currency validation is too lenient - accepts any string!
  if (!rate.currency) {
    errors.push('currency is required');
  }

  if (!rate.effective_date) {
    errors.push('effective_date is required');
  } else if (!isValidDate(rate.effective_date)) {
    errors.push('effective_date must be a valid ISO date (YYYY-MM-DD)');
  }

  if (!rate.end_date) {
    errors.push('end_date is required');
  } else if (!isValidDate(rate.end_date)) {
    errors.push('end_date must be a valid ISO date (YYYY-MM-DD)');
  }

  // Validate date range
  if (rate.effective_date && rate.end_date) {
    const startDate = new Date(rate.effective_date);
    const endDate = new Date(rate.end_date);

    if (startDate >= endDate) {
      errors.push('effective_date must be before end_date');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate property data
 */
function validateProperty(property) {
  const errors = [];

  if (!property.name || property.name.trim().length === 0) {
    errors.push('name is required');
  }

  if (!property.address || property.address.trim().length === 0) {
    errors.push('address is required');
  }

  if (!property.timezone) {
    errors.push('timezone is required');
  }

  if (property.status && !['active', 'inactive', 'maintenance'].includes(property.status)) {
    errors.push('status must be one of: active, inactive, maintenance');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate room type data
 */
function validateRoomType(roomType) {
  const errors = [];

  if (!roomType.property_id) {
    errors.push('property_id is required');
  }

  if (!roomType.name || roomType.name.trim().length === 0) {
    errors.push('name is required');
  }

  if (roomType.capacity !== undefined && (typeof roomType.capacity !== 'number' || roomType.capacity < 1)) {
    errors.push('capacity must be a positive number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate unit data
 */
function validateUnit(unit) {
  const errors = [];

  if (!unit.room_type_id) {
    errors.push('room_type_id is required');
  }

  if (!unit.unit_number || unit.unit_number.trim().length === 0) {
    errors.push('unit_number is required');
  }

  if (unit.status && !['available', 'occupied', 'maintenance', 'reserved'].includes(unit.status)) {
    errors.push('status must be one of: available, occupied, maintenance, reserved');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate booking data
 */
function validateBooking(booking) {
  const errors = [];

  if (!booking.unit_id) {
    errors.push('unit_id is required');
  }

  if (!booking.customer_name || booking.customer_name.trim().length === 0) {
    errors.push('customer_name is required');
  }

  if (!booking.customer_email) {
    errors.push('customer_email is required');
  } else if (!isValidEmail(booking.customer_email)) {
    errors.push('customer_email must be a valid email address');
  }

  if (!booking.start_date) {
    errors.push('start_date is required');
  } else if (!isValidDate(booking.start_date)) {
    errors.push('start_date must be a valid ISO date (YYYY-MM-DD)');
  }

  if (!booking.end_date) {
    errors.push('end_date is required');
  } else if (!isValidDate(booking.end_date)) {
    errors.push('end_date must be a valid ISO date (YYYY-MM-DD)');
  }

  // Validate date range
  if (booking.start_date && booking.end_date) {
    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);

    if (startDate >= endDate) {
      errors.push('start_date must be before end_date');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if string is a valid ISO date (YYYY-MM-DD)
 */
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Check if string is a valid email
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Create a validation error object
 */
function createValidationError(errors) {
  const error = new Error('Validation failed');
  error.statusCode = 400;
  error.code = 'VALIDATION_ERROR';
  error.details = errors;
  return error;
}

module.exports = {
  validateRate,
  validateProperty,
  validateRoomType,
  validateUnit,
  validateBooking,
  isValidDate,
  isValidEmail,
  createValidationError
};
