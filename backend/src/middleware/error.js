/** Express error handler — never leaks stack traces in production. */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message =
    status >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Something went wrong';

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err.message);
  }

  res.status(status).json({ error: message });
}

function notFound(req, res) {
  res.status(404).json({ error: 'Resource not found' });
}

module.exports = { errorHandler, notFound };
