const app = require('./app');
const port = process.env.PORT || 5001;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
