# Lunch & Attendance Management System

A full-stack web application to manage employee attendance and facilitate lunch planning for organizations. This project provides separate dashboards for Employees, Chefs, and Admins with a clean separation between frontend and backend.

## 🏗️ Project Structure

```
Lunch_attendence_system/
├── frontend/                 # Create React App (JavaScript)
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   └── services/        # API services
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── ...                  # Frontend config files
├── backend/                 # Express.js API Server (Modular)
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── index.js         # Main server file
│   ├── package.json         # Backend dependencies
│   └── .env                 # Environment variables
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or later)
- MongoDB (local installation or cloud instance)
- npm (v8 or later)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Lunch_attendence_system
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up environment variables:**
   ```bash
   # Create .env file in backend directory
   cd backend
   # Create .env file with your configuration
   ```

5. **Start the applications:**

   **Option 1: Using startup scripts (Recommended)**
   ```bash
   # Windows
   start-dev.bat
   
   # Linux/Mac
   chmod +x start-dev.sh
   ./start-dev.sh
   ```

   **Option 2: Manual startup**
   ```bash
   # Terminal 1 - Start backend
   cd backend
   npm run dev
   
   # Terminal 2 - Start frontend
   cd frontend
   npm start
   ```

## 📋 Available Scripts

### Frontend Scripts (in `frontend/` directory)
- `npm start` - Start Create React App development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

### Backend Scripts (in `backend/` directory)
- `npm run dev` - Start server with auto-reload
- `npm start` - Start server in production mode
- `npm test` - Run tests

## 🎯 Features

### Employee Dashboard
- Mark attendance (`office`, `home`, or `leave`)
- View and update attendance on a calendar
- Cutoff time enforcement for same-day attendance submission (9:30 AM)

### Chef Dashboard
- View daily employee count for on-site attendance
- Receive scheduled notifications at 9:30 AM to plan lunch

### Admin Dashboard
- View detailed daily attendance reports
- Visualize attendance trends over time
- Manage user accounts and update roles

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Axios** for API calls
- **date-fns** for date handling

### Backend
- **Express.js** with Node.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Node-Cron** for scheduled tasks
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Winston** for logging

## 🔐 Authentication & Security

- JWT-based authentication with 7-day token expiration
- Role-based access control (admin, employee, chef)
- Password hashing with bcryptjs
- Protected routes with automatic redirection
- Rate limiting and security headers

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  role: String (enum: ['admin', 'employee', 'chef'])
}
```

### Attendance Model
```javascript
{
  userId: ObjectId (ref: User),
  date: Date (required),
  status: String (enum: ['office', 'home', 'leave']),
  createdAt: Date (default: now)
}
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/monthly` - Get monthly attendance

### Admin
- `GET /api/admin/reports/daily` - Daily attendance report
- `GET /api/admin/reports/trends` - Attendance trends
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role

### Chef
- `GET /api/chef/daily-count` - Get daily office count

## 🔧 Development

### Environment Variables
Create a `.env` file in the root directory:
   ```
   PORT=5000
JWT_SECRET=your_jwt_secret_key_here
   MONGO_URI=mongodb://localhost:27017/lunch-attendance
NODE_ENV=development
```

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update the `MONGO_URI` in your `.env` file
3. The application will automatically create the database and seed initial data

### Default Users (Seeded Automatically)
- **Admin**: admin@example.com / admin123
- **Employee**: employee@example.com / employee123
- **Chef**: chef@example.com / chef123

## 📦 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Backend Deployment
   ```bash
cd backend
npm start
# Ensure MongoDB is accessible and environment variables are set
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.
