const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handle uncaught exception of application and exit application
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Load config variables
dotenv.config({ path: './config.env' });
const app = require('./app');

// Replace db password stored in config file
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Connect mongo db using mongoose client
// mongoose
//   .connect('mongodb://wenappu:w3nN3pal@192.168.2.112:27017/wen-app-v2', {
//     useNewUrlParser: true
//   })
//   .then(() => console.log('DB connection successful!'));
mongoose
  .connect(DB, {
    useNewUrlParser: true
  })
  .then(() => console.log('DB connection successful!'));

// Start express node application
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handle unhandled promise of application and exit application
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
