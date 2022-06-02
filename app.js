const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

// Initialized and start express application
const app = express();

// Implement CORS
app.use(cors());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '20kb'
  })
);

app.all('*', (req, res, next) => {
  next(new Error(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = app;
