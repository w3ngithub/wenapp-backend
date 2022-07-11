const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/users/userRoutes');
const userRoleRouter = require('./routes/users/userRoleRoutes');
const userPositionRouter = require('./routes/users/userPositionRoutes');

const projectTypeRouter = require('./routes/projects/projectTypeRoutes');
const projectStatusRouter = require('./routes/projects/projectStatusRoutes');
const projectTagRouter = require('./routes/projects/projectTagRoutes');
const clientRouter = require('./routes/projects/clientRoutes');
const projectRouter = require('./routes/projects/projectRoutes');

const timeLogTypeRouter = require('./routes/timelogs/timeLogTypeRoutes');
const timeLogRouter = require('./routes/timelogs/timeLogRoutes');

const leaveTypeRouter = require('./routes/leaves/leaveTypeRoutes');
const leaveRouter = require('./routes/leaves/leaveRoutes');

const blogCategoryRouter = require('./routes/blogs/blogCategoryRoutes');
const blogRouter = require('./routes/blogs/blogRoutes');

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

app.use('/api/v1/projects/types', projectTypeRouter);
app.use('/api/v1/projects/status', projectStatusRouter);
app.use('/api/v1/projects/tags', projectTagRouter);
app.use('/api/v1/projects/clients', clientRouter);
app.use('/api/v1/projects', projectRouter);

app.use('/api/v1/timelogs/types', timeLogTypeRouter);
app.use('/api/v1/timelogs', timeLogRouter);

app.use('/api/v1/leaves/types', leaveTypeRouter);
app.use('/api/v1/leaves', leaveRouter);

app.use('/api/v1/blogs/categories', blogCategoryRouter);
app.use('/api/v1/blogs', blogRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
