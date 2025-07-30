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

// Environment variables and configuration
const MONGODB_URI = process.env.MONGODB_URI;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

// Validate required environment variables
function validateEnvironmentVariables() {
  const required = [
    'MONGODB_URI',
    'GITHUB_CLIENT_ID', 
    'GITHUB_CLIENT_SECRET',
    'SESSION_SECRET'
  ];
  
  const missing = required.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(envVar => {
      console.error(`   - ${envVar}`);
    });
    console.error('\n📝 Please check your .env file and ensure all required variables are set.');
    console.error('💡 See .env.example for the template and SECURITY.md for setup instructions.\n');
    process.exit(1);
  }
  
  // Validate that placeholder values are not being used
  const placeholders = {
    'GITHUB_CLIENT_ID': 'your-github-oauth-client-id-here',
    'GITHUB_CLIENT_SECRET': 'your-github-oauth-client-secret-here',
    'MONGODB_URI': 'mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority',
    'SESSION_SECRET': 'your-unique-session-secret-here-generate-a-strong-random-string'
  };
  
  const usingPlaceholders = Object.entries(placeholders).filter(([envVar, placeholder]) => 
    process.env[envVar] === placeholder
  );
  
  if (usingPlaceholders.length > 0) {
    console.error('⚠️  WARNING: Placeholder values detected in environment variables:');
    usingPlaceholders.forEach(([envVar]) => {
      console.error(`   - ${envVar} is using placeholder value`);
    });
    console.error('\n🔧 Please replace placeholder values with your actual credentials.');
    console.error('📖 See SECURITY.md for detailed setup instructions.\n');
    
    if (isProduction) {
      console.error('❌ Cannot start in production with placeholder values!');
      process.exit(1);
    }
  }
}

// Validate environment on startup
validateEnvironmentVariables();
const frontendPath = isProduction 
  ? path.join(process.cwd(), 'frontend') 
  : path.join(__dirname, '../frontend');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(frontendPath, 'assets', 'uploads');
        // Create directory if it doesn't exist
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

const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image file.'), false);
    }
};

// Configure multer upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Improved MongoDB connection setup
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    console.log('Creating new MongoDB connection...');
    cachedConnection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 1,
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

// Additional route middleware

// Middleware
app.use(cors({
  origin: isProduction 
    ? ['https://cyber-shield-project.vercel.app']
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Configure static file serving
app.use(express.static(path.join(frontendPath, 'public')));
app.use('/css', express.static(path.join(frontendPath, 'css')));
app.use('/assets', express.static(path.join(frontendPath, 'assets')));
app.use('/js', express.static(path.join(frontendPath, 'assets/js')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: MONGODB_URI,
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// GitHub OAuth Configuration
const CALLBACK_URL = isProduction
    ? 'https://cyber-shield-project.vercel.app/auth/github/callback'
    : 'http://localhost:3000/auth/github/callback';

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        await connectToDatabase();
        
        // Create email from GitHub profile
        const email = profile.emails?.[0]?.value || 
            (profile.username ? `${profile.username}@github.com` : `user-${profile.id}@github.com`);
        
        // Find or create user
        const user = await User.findOneAndUpdate(
            { githubId: profile.id },
            { 
                name: profile.displayName || profile.username,
                email: email,
                profilePicture: profile.photos?.[0]?.value || '/assets/default-avatar.png'
            },
            { upsert: true, new: true }
        );
        return done(null, user);
    } catch (error) {
        console.error('Error in GitHub OAuth:', error);
        return done(error, null);
    }
}));

// Passport user serialization
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Routes have been consolidated in the Profile picture routes section

// Routes have been moved to the Auth Routes section below

// Log static paths for debugging
console.log('Frontend path:', frontendPath);
console.log('Static directories configured:', {
    public: path.join(frontendPath, 'public'),
    css: path.join(frontendPath, 'css'),
    assets: path.join(frontendPath, 'assets')
});

// Additional route middleware

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