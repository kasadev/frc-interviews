/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Default error response
  const response = {
    success: false,
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR'
    }
  };

  // Add details if available
  if (err.details) {
    response.error.details = err.details;
  }

  // Determine status code
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
