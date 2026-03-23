# 🍱 Lunch & Attendance Management System

A robust, enterprise-grade full-stack web application designed to manage everyday employee attendance and accurately facilitate lunch planning for organizations. This system solves office logistic requirements by giving separate, dedicated operational dashboards to **Employees**, **Chefs**, and **Administrators** through a highly secure frontend/backend architecture.

![Architecture](https://img.shields.io/badge/Architecture-MERN-blue.svg)
![Security](https://img.shields.io/badge/Security-HttpOnly_Cookies_|_Helmet_|_Rate_Limit-success.svg)
![Deployment](https://img.shields.io/badge/Deployment-Docker_|_Render-orange.svg)

---

## 🚀 Key Features

### 👨‍💻 Employee Dashboard
- **Daily Check-Ins:** Mark attendance simply as `Office`, `Home`, or `Leave`.
- **Calendar Perspective:** Visualize historical check-ins immediately via a monthly calendar widget.
- **Automated Cutoff Enforcement:** Employees checking in past 9:30 AM (IST) automatically roll over to the next day, ensuring chef planning numbers stay entirely accurate regardless of individual timezone manipulations.

### 👨‍🍳 Chef Dashboard
- **Real-Time Logistics:** View precise daily counts of incoming, on-site employees.
- **Resource Management:** Plan meal preparations adequately based on real-time data, reducing food waste and ensuring nobody goes hungry.

### 👑 Administrator Console
- **Detailed Reports:** Analyze extensive daily and monthly attendance histories.
- **O(1) Trend Graphs:** Track visual trends of Office/Home/Leave frequencies utilizing hyper-fast MongoDB aggregation pipelines.
- **Role Management:** Full lifecycle control of users, allowing role swapping on the fly (Promote to Chef/Admin).

---

## 🛡️ "Like a Boss" Security

This application has been relentlessly hardened against common web exploits:
- **HttpOnly Cookies:** JWT authentication tokens are encrypted and hidden from JavaScript completely natively by the browser, rendering **XSS** token theft virtually impossible.
- **Strict Rate Limiting:** Global endpoints enforce a cap to neutralize data scrapers. Furthermore, the `login` and `register` endpoints restrict IPs to **5 attempts per 15 minutes** to permanently shut down brute-force attacks.
- **NoSQL Injection Blocked:** All network payloads are recursively sanitized via `express-mongo-sanitize` prior to reaching the database model.
- **Headers & Request Enforcement:** Powered by `helmet` security headers, strict exact-match date verifications, password complexity minimums, and strict environment deployment validation rules.

---

## 🛠️ Technology Stack

**Frontend (Client)**
- **Framework:** React 18 (CRA)
- **Networking:** Axios (`withCredentials: true` for silent HTTP cookies)
- **Routing:** React Router v6
- **Styling:** Tailwind CSS

**Backend (API Server)**
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT + Bcrypt + Cookie-Parser
- **Defense:** Helmet, Express Rate Limit, Express Mongo Sanitize

---

## 🏗️ Project Architecture

```text
Lunch_attendence_system/
├── frontend/                 # React Application
│   ├── public/             
│   ├── src/
│   │   ├── components/       # Common, Admin, and Employee atomic React components
│   │   ├── contexts/         # React Context API providers (Auth checks /me)
│   │   ├── pages/            # Top-level Page views
│   │   └── services/         # Axios API configurations
│   ├── Dockerfile            # Multi-stage Nginx Static Build Config
│   └── .env                  # Frontend variables
├── backend/                  # Express.js REST API
│   ├── src/
│   │   ├── config/           # DB Configuration, Cron Jobs, Sample Seed Data
│   │   ├── middleware/       # Cookie extraction & Role authorization
│   │   ├── models/           # Mongoose schemas 
│   │   ├── routes/           # Separated route controllers (Auth, Admin, Chef)
│   │   └── index.js          # API Entry-point
│   ├── Dockerfile            # Alpine Node container config
│   └── .env                  # Secure Secrets Vault
├── docker-compose.yml        # Orchestration Blueprint
└── render.yaml               # Cloud IaC Template
```

---

## ⚙️ Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or newer recommended)
- [MongoDB](https://www.mongodb.com/) (Local installation or Atlas URI instance)

### 1. Installation

```bash
git clone https://github.com/SammedBG/Attendance-and-Lunch-Management-System.git
cd Attendance-and-Lunch-Management-System

# Install dependencies concurrently
cd frontend && npm install
cd ../backend && npm install
```

### 2. Environment Configuration

**Backend (`backend/.env`):**
Create the `.env` configuration completely outside the React zone to protect secrets:
```env
PORT=5000
JWT_SECRET=super_secret_key_make_this_long_and_complex
MONGO_URI=mongodb://127.0.0.1:27017/lunch-attendance
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend (`frontend/.env`):**
CRA only detects prefixed variables. Provide your API path here:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start the Ecosystem

You can orchestrate both systems manually, or utilize the helper scripts:

```bash
# Terminal window 1 (Backend API)
cd backend && npm run dev

# Terminal window 2 (Frontend React App)
cd frontend && npm start
```

---

## 🐳 Docker Deployment

The application is fully configured for instantaneous containerization. A production-grade Nginx build of the React App and a Node.js container for the API can be orchestrated alongside a unified MongoDB container entirely via Docker.

```bash
# In the root project directory:
docker compose up --build -d
```
The Frontend will immediately become available mapped to `http://localhost:3000` executing blazing-fast static compiled assets.

---

## ☁️ Render Cloud Deployment

The repository includes a `render.yaml` Infrastructure-as-Code (IaC) configuration.
If you connect your Render.com workspace to this repository, Render will natively extract the `render.yaml` file and simultaneously spin up Both the Web-App and Node API into production with zero-configuration required. 

*(Make sure you provide the `JWT_SECRET` and `MONGO_URI` strings within the Render environment dashboard!)*

---

## 🔐 Default Seed Users

On the initial server boot, the database identifies empty collections and dynamically populates default users so you can test all panels immediately:

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` |
| **Chef** | `chef@example.com` | `chef123` |
| **Employee** | `employee@example.com` | `employee123` |

---

## 🌐 Complete API Ledger

| Group | Method | Path | Security Level | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | 5 Req/15 Min. | Check credentials & Issue HttpOnly Cookie |
| | `POST` | `/api/auth/register` | 5 Req/15 Min. | Check regex requirements & Create User |
| | `POST` | `/api/auth/logout` | `Cookie` | Instructs browser to destruct internal cookie |
| | `GET` | `/api/auth/me` | `Cookie` | Auto-verify session state on frontend boot |
| **Attendance**| `POST` | `/api/attendance` | Employees | Normalizes UTC Midnight & Parses Check-ins |
| | `GET` | `/api/attendance` | Employees | Return single check-in |
| | `GET` | `/api/attendance/monthly` | Employees | Return monthly array |
| **Chef** | `GET` | `/api/chef/daily-count` | Chefs | Sum total for 'Office' statuses matching IST Today |
| **Admin** | `GET` | `/api/admin/reports/daily` | Admins | High-detail specific individual ledger |
| | `GET` | `/api/admin/reports/trends` | Admins | Aggregation pipeline summarizing total history |
| | `GET` | `/api/admin/users` | Admins | Returns accounts |
| | `PUT` | `/api/admin/users/:userId/role`| Admins | Escalates/Demotes accounts dynamically |

---

## 📄 License & Contributing

This software is provided under the [MIT License](LICENSE).
Contributions, bug reports, and pull requests are welcomed. Ensure your code satisfies standard linting requirements and does not introduce `localStorage` token tracking regressions.
