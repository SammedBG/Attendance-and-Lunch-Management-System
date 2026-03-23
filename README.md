# 🍱 Lunch & Attendance Management System

A robust, full-stack web application designed to manage everyday employee attendance and accurately facilitate lunch planning for organizations. This system solves office logistic requirements by giving separate, dedicated operational dashboards to **Employees**, **Chefs**, and **Administrators** through a clean frontend/backend architecture.

---

## 🚀 Key Features

### Employee Dashboard
- **Daily Check-Ins:** Mark attendance simply as `Office`, `Home`, or `Leave`.
- **Calendar Perspective:** Visualize historical check-ins immediately via a monthly calendar widget.
- **Automated Cutoff Enforcement:** Employees checking in past 9:30 AM automatically roll over to the next day, ensuring chef planning numbers stay entirely accurate.

### Chef Dashboard
- **Real-Time Logistics:** View precise daily counts of incoming, on-site employees.
- **Resource Management:** Plan meal preparations adequately based on real-time data, reducing food waste and ensuring nobody goes hungry.

### Administrator Console
- **Detailed Reports:** Analyze extensive daily and monthly attendance histories.
- **Attendance Trend Graphs:** Track visual trends of Office/Home/Leave frequencies utilizing fast MongoDB aggregation pipelines.
- **Role Management:** Full lifecycle control of users, allowing role swapping on the fly (Promote to Chef/Admin).

---

## 🛠️ Technology Stack

**Frontend**
- **Framework:** React 18 (Create React App) with JavaScript (ES6+)
- **Styling:** Tailwind CSS for rapid responsive design
- **Routing:** React Router v6
- **Data Visualization:** Recharts
- **Networking:** Axios, Date-fns

**Backend**
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) with Bcrypt password hashing
- **Security:** Helmet, Express Rate Limit, CORS
- **Scheduling:** Node-Cron (for automated Chef notifications)

---

## 🏗️ Project Architecture

```text
Lunch_attendence_system/
├── frontend/                 # React Application
│   ├── public/               # Static web assets
│   ├── src/
│   │   ├── components/       # Common, Admin, and Employee atomic components
│   │   ├── contexts/         # React Context API providers (Auth)
│   │   ├── pages/            # Top-level Page views
│   │   └── services/         # Axios API definitions
│   └── package.json    
├── backend/                  # Express.js REST API
│   ├── src/
│   │   ├── config/           # DB Configuration, Cron Jobs, Sample Seed Data
│   │   ├── middleware/       # JWT Authentication & Role authorization
│   │   ├── models/           # Mongoose schemas (User, Attendance)
│   │   ├── routes/           # Separated route controllers
│   │   └── index.js          # Entry-point
│   └── package.json        
├── start-dev.bat             # Windows Startup Script
├── start-dev.sh              # Unix/Mac Startup Script
└── README.md
```

---

## ⚙️ Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or newer recommended)
- [MongoDB](https://www.mongodb.com/) (Local installation or Atlas URI instance)

### 1. Installation

Clone the repository and install the respective dependencies:

```bash
git clone https://github.com/SammedBG/Attendance-and-Lunch-Management-System.git
cd Attendance-and-Lunch-Management-System

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Configuration

Create a `.env` file inside the `backend/` directory providing these configuration variables:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
MONGO_URI=mongodb://127.0.0.1:27017/lunch-attendance
NODE_ENV=development
```

*(Note: The Frontend dynamically defaults to `http://localhost:5000/api` natively, however, `REACT_APP_API_URL` can be defined if you run the backend on a different port).*

### 3. Start the Ecosystem

You can orchestrate both systems manually, or utilize the helper scripts:

**Using helper scripts (from the project root):**
```bash
# On Windows
./start-dev.bat

# On Linux or Mac
chmod +x start-dev.sh
./start-dev.sh
```

**Manual Start:**
```bash
# Terminal window 1 (Backend)
cd backend && npm run dev

# Terminal window 2 (Frontend)
cd frontend && npm start
```

*The API will be available at `http://localhost:5000` and the web portal will execute at `http://localhost:3000`.*

---

## 🔐 Default Seed Data & Users

On the initial backend boot, the database is dynamically populated with default users (if the collections are empty) to expedite development testing:

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` |
| **Chef** | `chef@example.com` | `chef123` |
| **Employee** | `employee@example.com` | `employee123` |

---

## 🌐 API Endpoints Reference

| Application Space | HTTP Request | Endpoint URI | Description |
| :--- | :--- | :--- | :--- |
| **Authentication** | `POST` | `/api/auth/login` | Authenticate and retrieve JWT token |
| | `POST` | `/api/auth/register` | Register new employee entity |
| | `GET` | `/api/auth/me` | Refresh token profiles & user mapping |
| **Attendance** | `POST` | `/api/attendance` | Process daily check-in (requires employee access) |
| | `GET` | `/api/attendance` | Retrieve historical individual records |
| | `GET` | `/api/attendance/monthly` | Retrieve aggregated individual monthly spread |
| **Chef** | `GET` | `/api/chef/daily-count` | Live summary metric of 'Office' check-ins |
| **Admin** | `GET` | `/api/admin/reports/daily` | Highly-detailed daily individual check-out ledger |
| | `GET` | `/api/admin/reports/trends` | Time-series chart aggregations |
| | `GET` | `/api/admin/users` | List platform accounts |
| | `PUT` | `/api/admin/users/:userId/role` | Escalate or demote user permissions |

---

## 📄 License & Contributing

This software is provided under the [MIT License](LICENSE).
Contributions, bug reports, and pull requests are welcomed to help mature the product footprint. Please make sure to test UI interactions against existing rules before pushing branches.
