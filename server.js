// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please fill all fields' });
  }

  // Demo credentials (replace later with database)
  const users = {
    'student@ryan.com': 'student123',
    'teacher@ryan.com': 'teacher123',
    'admin@ryan.com': 'admin123'
  };

  // Authentication logic
  if (users[email] && users[email] === password) {
    return res.json({ success: true, message: 'Login Successful', role: email.split('@')[0] });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid Credentials' });
  }
});

// Error handling for invalid routes
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
