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
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   SESSION_SECRET=your_session_secret
   GITHUB_CLIENT_ID=your_github_oauth_client_id
   GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
   ADMIN_PASSWORD=your_admin_password
   ```

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
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   Or from the backend directory:
   ```bash
   cd backend
   npm start
   ```

3. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

### Environment Variables

The project uses a `.env` file in the backend directory with the following variables:

- `GITHUB_CLIENT_ID` - GitHub OAuth Client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth Client Secret  
- `SESSION_SECRET` - Secret key for session encryption
- `ADMIN_PASSWORD` - Password for admin access

## Usage

1. **Home Page**: Visit `http://localhost:3000` to see the main landing page
2. **Authentication**: 
   - Sign up with email and password
   - Or sign in with GitHub
3. **Dashboard**: Access security features after login
4. **Profile**: Manage your profile settings

## API Endpoints

- `GET /` - Home page
- `GET /public/login.html` - Login page
- `GET /public/dashboard.html` - Dashboard (authenticated)
- `GET /public/profile.html` - Profile page (authenticated)
- `POST /signup` - User registration
- `POST /login` - User login
- `GET /auth/github` - GitHub OAuth
- `GET /logout` - User logout
- `GET /user` - Get user data (authenticated)

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: Passport.js, bcrypt
- **Frontend**: HTML5, CSS3, JavaScript
- **Session Store**: MongoDB

## Development

To run in development mode:

```bash
npm run dev
```

The server will start on `http://localhost:3000` and serve both the API and static files.
