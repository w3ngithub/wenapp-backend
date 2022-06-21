const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const projectTagRouter = require('./routes/projectTagRoutes');
const clientRouter = require('./routes/clientRoutes');
const projectRouter = require('./routes/projectRoutes');
const userRoleRouter = require('./routes/userRoleRoutes');
const userPositionRouter = require('./routes/userPositionRoutes');

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

// Routes
app.use('/api/v1/users/roles', userRoleRouter);
app.use('/api/v1/users/positions', userPositionRouter);
app.use('/api/v1/users', userRouter);

app.use('/api/v1/projects/tags', projectTagRouter);
app.use('/api/v1/projects/clients', clientRouter);
app.use('/api/v1/projects', projectRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
