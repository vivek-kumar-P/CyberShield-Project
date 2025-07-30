# 🛡️ CyberShield - Advanced Cybersecurity Dashboard

A modern, futuristic cybersecurity management platform built with Node.js, Express, and MongoDB. Features a glassmorphism UI design with real-time threat monitoring and resource analytics.

![CyberShield Dashboard](frontend/assets/image.png)

## ✨ Features

### 🔐 Authentication & Security
- **Multi-Authentication Support**: Email/password and GitHub OAuth integration
- **Secure Session Management**: Express sessions with MongoDB store
- **Profile Management**: Secure profile picture uploads with validation
- **Auto-redirect**: Seamless user experience after signup/login

### 📊 Real-time Analytics
- **Resource Monitoring**: Live CPU, Memory, Network, and Storage tracking
- **Threat Detection Dashboard**: Interactive pie charts for security incidents
- **Live Data Simulation**: Real-time updates every 3 seconds
- **Interactive Charts**: Hover effects and detailed tooltips using Chart.js

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Transparent elements with backdrop blur effects
- **Futuristic Aesthetic**: Orbitron font and cyberpunk color schemes
- **Responsive Layout**: Mobile-first design with CSS Grid
- **Smooth Animations**: Hardware-accelerated transitions and micro-interactions
- **Notification System**: Elegant popup notifications with auto-hide

### 🏗️ Technical Architecture
- **Separation of Concerns**: Clean HTML, CSS, and JavaScript structure
- **Performance Optimized**: Hardware acceleration and efficient rendering
- **Error Handling**: Comprehensive error management and user feedback
- **File Upload System**: Multer integration for secure file handling

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CyberShield.git
   cd CyberShield
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Setup**
   Copy the `.env.example` file to `.env` and configure with your actual values:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your actual credentials:
   ```env
   NODE_ENV=development
   SESSION_SECRET=your-unique-session-secret-here-generate-a-strong-random-string
   GITHUB_CLIENT_ID=your-github-oauth-client-id-here
   GITHUB_CLIENT_SECRET=your-github-oauth-client-secret-here
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ADMIN_PASSWORD=your-secure-admin-password-here
   ```
   
   **⚠️ Security Note**: Never commit the `.env` file to version control. The `.env.example` file contains placeholder values only.

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
CyberShield/
├── backend/                    # Server-side code
│   ├── server.js              # Express server with authentication
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment variables (not in repo)
├── frontend/                   # Client-side code
│   ├── assets/                # Static assets
│   │   ├── js/
│   │   │   └── profile.js     # Profile page functionality
│   │   ├── uploads/           # User profile pictures
│   │   ├── image.png          # Logo and images
│   │   └── default-avatar.png
│   ├── css/                   # Stylesheets
│   │   ├── styles.css         # Base styles
│   │   ├── dashboard.css      # Dashboard and glassmorphism
│   │   ├── login.css          # Authentication pages
│   │   └── profile.css        # Profile-specific styles
│   └── public/                # HTML pages
│       ├── index.html         # Landing page
│       ├── login.html         # Authentication
│       ├── dashboard.html     # Main dashboard
│       └── profile.html       # User profile
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Passport.js** for authentication strategies
- **Multer** for file upload handling
- **Express-session** with MongoDB store

### Frontend
- **HTML5** with semantic structure
- **CSS3** with modern features (Grid, Flexbox, Backdrop-filter)
- **Vanilla JavaScript** with ES6+ features
- **Chart.js** for data visualization
- **Google Fonts** (Inter, Orbitron)

### Security Features
- **CORS** protection
- **Session-based** authentication
- **File type validation** for uploads
- **Password hashing** with bcrypt
- **Environment variable** protection

## 🎨 Design System

### Color Palette
- **Primary**: `#3b82f6` (Blue)
- **Secondary**: `#8b5cf6` (Purple)  
- **Accent**: `#06b6d4` (Cyan)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Error**: `#ef4444` (Red)

### Typography
- **Primary Font**: Inter (400, 600, 700)
- **Display Font**: Orbitron (400-900) for futuristic elements

### Effects
- **Glassmorphism**: `backdrop-filter: blur(20px)`
- **Gradients**: Multi-stop linear gradients
- **Animations**: Cubic-bezier easing functions
- **Shadows**: Layered box-shadows for depth

## 📊 Features Overview

### Dashboard Features
- **Real-time Resource Monitoring**: CPU, Memory, Network, Storage
- **Threat Detection Analytics**: Visual representation of security incidents
- **Interactive Charts**: Toggle between different chart types
- **Live Data Updates**: Simulated real-time data every 3 seconds

### Profile Management
- **Profile Picture Upload**: Drag-and-drop or click to upload
- **User Information Display**: Name, email, status indicators
- **Security Statistics**: Threats blocked, warnings, alerts, uptime
- **Resource Usage Visualization**: Color-coded indicators

### Authentication System
- **Email/Password Authentication**: Secure login with form validation
- **GitHub OAuth Integration**: Social login capability
- **Session Management**: Persistent sessions across page refreshes
- **Auto-redirect**: Seamless navigation after authentication

## 🔧 API Endpoints

### Authentication
- `POST /signup` - User registration
- `POST /login` - User login
- `GET /logout` - User logout
- `GET /auth/github` - GitHub OAuth
- `GET /auth/github/callback` - OAuth callback

### User Management
- `GET /user` - Get current user info
- `POST /upload-profile-picture` - Upload profile picture

### Admin
- `GET /admin/users` - Get all users (admin only)

## 🔐 Environment Variables Configuration

### Required Environment Variables

The application requires the following environment variables to be configured:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development` or `production` |
| `SESSION_SECRET` | Secret key for session encryption | `your-unique-32-character-secret-key` |
| `GITHUB_CLIENT_ID` | GitHub OAuth Application Client ID | `Ov23liXXXXXXXXXXXX` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Application Client Secret | `your-github-oauth-secret` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `ADMIN_PASSWORD` | Password for admin access | `your-secure-admin-password` |

### Setting Up Environment Variables

1. **Copy the template file:**
   ```bash
   cp .env.example .env
   ```

2. **Configure GitHub OAuth:**
   - Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
   - Create a new OAuth App
   - Set Homepage URL: `http://localhost:3000` (for development)
   - Set Authorization callback URL: `http://localhost:3000/auth/github/callback`
   - Copy the Client ID and Client Secret to your `.env` file

3. **Configure MongoDB:**
   - Create a free account at [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a new cluster
   - Create a database user
   - Copy the connection string to your `.env` file
   - Replace `<password>` with your database user password

4. **Generate a Session Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Set Admin Password:**
   - Choose a strong password for admin access
   - This is used for accessing admin endpoints

### Production Environment Variables

For production deployment (e.g., Vercel, Heroku):

1. **Vercel**: Add environment variables in the Vercel dashboard
2. **Heroku**: Use `heroku config:set VARIABLE_NAME=value`
3. **Other platforms**: Refer to your platform's documentation

**⚠️ Security Best Practices:**
- Never commit `.env` files to version control
- Use strong, unique values for all secrets
- Rotate secrets regularly
- Use different values for development and production

## 🚀 Deployment

### Environment Variables
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Session
SESSION_SECRET=your-super-secret-session-key

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Admin
ADMIN_PASSWORD=your-admin-password
```

### Production Setup
1. Set up MongoDB Atlas cluster
2. Configure GitHub OAuth app
3. Set environment variables on your hosting platform
4. Deploy to your preferred platform (Heroku, Vercel, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Chart.js** for beautiful data visualizations
- **MongoDB Atlas** for database hosting
- **GitHub** for OAuth integration
- **Google Fonts** for typography
- **The cybersecurity community** for inspiration

## 📞 Support

For support, email info@cybershield.com or create an issue in this repository.

---

Made with ❤️ and lots of ☕ by the CyberShield team.
