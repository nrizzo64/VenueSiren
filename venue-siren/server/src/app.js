const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Example route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// You can add more routes here or in separate route files

module.exports = app;
