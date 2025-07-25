const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://cyber-shield-project.vercel.app']
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Static file serving - adjust paths for Vercel
const isProduction = process.env.NODE_ENV === 'production';
const frontendPath = isProduction 
  ? path.join(process.cwd(), 'frontend') 
  : path.join(__dirname, '../frontend');

// Configure static file serving
app.use(express.static(path.join(frontendPath, 'public')));
app.use('/css', express.static(path.join(frontendPath, 'css')));
app.use('/assets', express.static(path.join(frontendPath, 'assets')));
app.use('/js', express.static(path.join(frontendPath, 'assets/js')));

// Log static paths for debugging
console.log('Frontend path:', frontendPath);
console.log('Static directories configured:', {
  public: path.join(frontendPath, 'public'),
  css: path.join(frontendPath, 'css'),
  assets: path.join(frontendPath, 'assets')
});

// MongoDB Atlas Connection String
const MONGODB_URI = process.env.MONGODB_URI ;

// Improved MongoDB connection for serverless environment
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    console.log('Creating new MongoDB connection...');
    cachedConnection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 1, // Maintain up to 1 socket connection for serverless
    });
    console.log('Connected to MongoDB Atlas');
    return cachedConnection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

// Initialize connection
connectToDatabase();

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: MONGODB_URI,
    touchAfter: 24 * 3600, // lazy session update
    ttl: 24 * 60 * 60 // 24 hours
  }),
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    httpOnly: true
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// User Schema - Check if model already exists to avoid OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', {
  name: String,
  email: { type: String, unique: true },
  password: String,
  githubId: String,
  profilePicture: { type: String, default: '/assets/user-icon.svg' },
  newsletter: { type: Boolean, default: false },
  lastLogin: Date,
  securityScore: { type: Number, default: 0 },
  preferences: {
    twoFactorEnabled: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    activityAlerts: { type: Boolean, default: true }
  }
});

// Multer configuration for file uploads - Vercel compatible
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = isProduction 
      ? path.join(process.cwd(), 'frontend/assets/uploads')
      : path.join(__dirname, '../frontend/assets/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Passport Serialization
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// GitHub OAuth
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || 'Ov23lia45eitwAS1qbWz',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '3a72901bb03a117400717cad61670966e4cd79c4',
  callbackURL: isProduction 
    ? 'https://cyber-shield-project.vercel.app/auth/github/callback'
    : 'http://localhost:3000/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Ensure database connection
    await connectToDatabase();
    
    console.log('GitHub Profile:', profile);
    const email = profile.emails && profile.emails[0] && profile.emails[0].value
      ? profile.emails[0].value
      : (profile.username ? `${profile.username}@github.com` : `user-${profile.id}@github.com`);
    const user = await User.findOneAndUpdate(
      { githubId: profile.id },
      { email: email, profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : '/assets/default-avatar.png' },
      { upsert: true, new: true }
    );
    return done(null, user);
  } catch (err) {
    console.error('Error in GitHub OAuth:', err);
    return done(err);
  }
}));

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/login.html');
};

// Admin middleware (basic password protection)
const isAdmin = (req, res, next) => {
  const adminPassword = req.headers['x-admin-password'];
  if (adminPassword === process.env.ADMIN_PASSWORD || adminPassword === 'your-admin-password') {
    return next();
  }
  res.status(403).json({ error: 'Unauthorized' });
};

// Routes
app.get('/', (req, res) => {
  console.log('Root route accessed');
  if (req.isAuthenticated()) {
    res.redirect('/dashboard.html');
  } else {
    const publicPath = isProduction 
      ? path.join(process.cwd(), 'frontend/public')
      : path.join(__dirname, '../frontend/public');
    res.sendFile('index.html', { root: publicPath });
  }
});

app.get('/dashboard.html', isAuthenticated, (req, res) => {
  const publicPath = isProduction 
    ? path.join(process.cwd(), 'frontend/public')
    : path.join(__dirname, '../frontend/public');
  res.sendFile('dashboard.html', { root: publicPath });
});

app.get('/profile.html', isAuthenticated, (req, res) => {
  const publicPath = isProduction 
    ? path.join(process.cwd(), 'frontend/public')
    : path.join(__dirname, '../frontend/public');
  res.sendFile('profile.html', { root: publicPath });
});

app.get('/login.html', (req, res) => {
  console.log('Login.html route accessed');
  const publicPath = isProduction 
    ? path.join(process.cwd(), 'frontend/public')
    : path.join(__dirname, '../frontend/public');
  res.sendFile('login.html', { root: publicPath });
});

app.get('/index.html', (req, res) => {
  const publicPath = isProduction 
    ? path.join(process.cwd(), 'frontend/public')
    : path.join(__dirname, '../frontend/public');
  res.sendFile('index.html', { root: publicPath });
});

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email', 'read:user'] }));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login.html' }), (req, res) => {
  res.redirect('/dashboard.html');
});

app.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    
    // Automatically log the user in after successful signup
    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json({ message: 'User created and logged in successfully' });
    });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

app.post('/login', async (req, res, next) => {
  try {
    // Ensure database connection
    await connectToDatabase();
    
    console.log('Login attempt:', req.body.email);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    req.login(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return next(err);
      }
      console.log('Login successful for user:', email);
      res.json({ message: 'Login successful' });
    });
  } catch (err) {
    console.error('Login route error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.redirect('/');
  });
});

app.get('/user', isAuthenticated, (req, res) => {
  res.json({ user: { name: req.user.name, email: req.user.email, profilePicture: req.user.profilePicture } });
});

// Profile picture upload endpoint
app.post('/upload-profile-picture', isAuthenticated, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const profilePicturePath = `/assets/uploads/${req.file.filename}`;
    
    // Delete old profile picture if it exists and is not the default
    if (req.user.profilePicture && !req.user.profilePicture.includes('default-avatar') && !req.user.profilePicture.includes('user-icon')) {
      const oldPicturePath = path.join(frontendPath, req.user.profilePicture);
      try {
        await fs.promises.unlink(oldPicturePath);
      } catch (err) {
        console.error('Error deleting old profile picture:', err);
      }
    }
    
    // Update user profile picture in database
    await User.findByIdAndUpdate(req.user._id, { profilePicture: profilePicturePath });
    
    // Update session user object
    req.user.profilePicture = profilePicturePath;
    
    res.json({ 
      success: true, 
      profilePicture: profilePicturePath,
      message: 'Profile picture updated successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Delete profile picture endpoint
app.delete('/profile-picture', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Check if user has a custom profile picture
    if (user.profilePicture && !user.profilePicture.includes('default-avatar') && !user.profilePicture.includes('user-icon')) {
      // Delete the file
      const picturePath = path.join(frontendPath, user.profilePicture);
      try {
        await fs.promises.unlink(picturePath);
      } catch (err) {
        console.error('Error deleting profile picture file:', err);
      }
    }

    // Reset to default avatar
    const defaultAvatar = '/assets/user-icon.svg';
    await User.findByIdAndUpdate(req.user._id, { profilePicture: defaultAvatar });
    
    // Update session user object
    req.user.profilePicture = defaultAvatar;
    
    res.json({ 
      success: true, 
      profilePicture: defaultAvatar,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({ error: 'Failed to delete profile picture' });
  }
});

app.get('/admin/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'name email githubId profilePicture');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Newsletter subscription endpoint
app.post('/api/subscribe', isAuthenticated, async (req, res) => {
  try {
    // Use the authenticated user's email
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.newsletter = true;
    await user.save();
    
    res.json({ 
      success: true,
      message: 'Successfully subscribed to newsletter'
    });
  } catch (err) {
    console.error('Subscription error:', err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  if (err.message.includes('path-to-regexp')) {
    console.error('Path-to-regexp error detected:', req.url);
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

// Export for Vercel
module.exports = app;