const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Specific NASA API error handling
  if (err.response && err.response.status === 429) {
    statusCode = 429;
    message = 'NASA API rate limit exceeded. Please try again later.';
  } else if (err.response && err.response.status >= 500) {
    statusCode = 503;
    message = 'NASA Service Unavailable';
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null
  });
};

module.exports = errorHandler;
