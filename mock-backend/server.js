const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;
const JWT_SECRET = 'mock-secret-key-123456';
const DATA_FILE = path.join(__dirname, 'data.json');

// Load data from file or initialize
const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      return { users: data.users || [], activities: data.activities || [] };
    }
  } catch (err) {
    console.error('Error loading data:', err);
  }
  return { users: [], activities: [] };
};

// Save data to file
const saveData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users, activities }, null, 2));
  } catch (err) {
    console.error('Error saving data:', err);
  }
};

// Initialize data
const { users, activities } = loadData();

app.use(cors());
app.use(express.json());

// Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Mock backend running' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, fullName } = req.body;
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already taken' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email already registered' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: users.length + 1,
    username,
    email,
    password: hashedPassword,
    fullName,
    role: 'USER'
  };
  
  users.push(user);
  saveData();
  res.json({ message: 'User registered successfully' });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    token,
    type: 'Bearer',
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  });
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

// Update profile
app.put('/api/auth/profile', authMiddleware, (req, res) => {
  const { fullName, email } = req.body;
  const user = users.find(u => String(u.id) === String(req.user.id));
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  user.fullName = fullName || user.fullName;
  user.email = email || user.email;
  saveData();
  res.json({ message: 'Profile updated successfully', user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName, role: user.role } });
});

// Change password
app.put('/api/auth/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = users.find(u => String(u.id) === String(req.user.id));
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  
  user.password = await bcrypt.hash(newPassword, 10);
  saveData();
  res.json({ message: 'Password changed successfully' });
});

// Analyze risk (mock - calls AI service)
app.post('/api/analyze', authMiddleware, async (req, res) => {
  try {
    const response = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const result = await response.json();
    
    // Store activity
    const activity = {
      id: activities.length + 1,
      ...req.body,
      riskScore: result.risk,
      riskLevel: result.level,
      createdAt: new Date().toISOString()
    };
    activities.push(activity);
    saveData();
    res.json(result);
  } catch (err) {
    // Fallback calculation with all behavior factors
    let score = 0;
    const { 
      loginTime, failAttempts, locationChange, txnAmount,
      apiCallsPerMinute, repeatedRequests, unusualEndpointAccess,
      passwordResetAttempts, otpFailures, multipleAccountsTried
    } = req.body;
    
    // Authentication behavior
    if (loginTime < 6 || loginTime > 23) score += 20;
    if (failAttempts) score += failAttempts * 8;
    
    // Geographic behavior
    if (locationChange === 1) score += 25;
    
    // Transaction behavior
    if (txnAmount > 5000) score += 30;
    else if (txnAmount > 2000) score += 15;
    
    // API/Request behavior
    if (apiCallsPerMinute > 100) score += 20;
    if (repeatedRequests > 5) score += 15;
    if (unusualEndpointAccess === 1) score += 25;
    
    // Credential behavior
    if (passwordResetAttempts > 2) score += 15;
    if (otpFailures > 3) score += 20;
    if (multipleAccountsTried === 1) score += 25;
    
    score = Math.min(score, 100);
    const level = score <= 30 ? 'LOW' : score <= 70 ? 'MEDIUM' : 'HIGH';
    
    res.json({ risk: score, level, fallback: true });
  }
});

// Get all activities
app.get('/api/all', authMiddleware, (req, res) => {
  res.json(activities.slice().reverse());
});

// Get high risk activities
app.get('/api/high-risk', authMiddleware, (req, res) => {
  res.json(activities.filter(a => a.riskLevel === 'HIGH').reverse());
});

app.listen(PORT, () => {
  console.log(`Mock backend running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  POST /api/auth/register`);
  console.log(`  POST /api/auth/login`);
  console.log(`  GET  /api/auth/me`);
  console.log(`  PUT  /api/auth/profile`);
  console.log(`  PUT  /api/auth/password`);
  console.log(`  POST /api/analyze`);
  console.log(`  GET  /api/all`);
  console.log(`  GET  /api/high-risk`);
});
