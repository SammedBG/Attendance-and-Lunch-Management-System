# 🍱 Lunch & Attendance Management System

A robust, enterprise-grade full-stack web application designed to manage everyday employee attendance and accurately facilitate lunch planning for organizations. This system solves office logistic requirements by giving separate, dedicated operational dashboards to **Employees**, **Chefs**, and **Administrators** through a highly secure frontend/backend architecture.

![Architecture](https://img.shields.io/badge/Architecture-MERN-blue.svg)
![Security](https://img.shields.io/badge/Security-Dual_HttpOnly_Cookies_|_Helmet_|_Rate_Limit-success.svg)
![Deployment](https://img.shields.io/badge/Deployment-Docker_|_Render_|_Vercel-orange.svg)

---

## 🔗 Live Demo & Sandbox

If you are a company looking to evaluate this ecosystem before deployment, you can access the live demo environment here:
* **Live Application:** https://attendance-and-lunch-management-sys.vercel.app/login
* **Interactive API Swagger Docs:** https://attendance-and-lunch-management-system.onrender.com

Use the following highly restrictive demo accounts to explore the different hierarchy dashboards safely:

| Access Level | Email Address | Password | Function |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@example.com` | `admin123` | Can view reports, trend analytics, and promote/demote user roles. |
| **Head Chef** | `chef@example.com` | `chef123` | Can exclusively view the daily "Office" lunch count requirements. |
| **Standard Employee**| `employee@example.com` | `employee123` | Can login, mark attendance, and view their personal calendar history. |

---

## ⚙️ How the Ecosystem Actually Works

The architecture runs on a strictly time-gated, three-tier user hierarchy. Every role intimately connects to produce a seamless daily flow of data:

### 1. The Core Engine (9:30 AM IST Temporal Cutoff)
Unlike standard applications, this platform utilizes hard-coded **Indian Standard Time (IST)** validation logic via backend controllers. 
- At exactly **9:30 AM IST**, the backend dynamically slices the active day. 
- If an Employee tries to mark their attendance *before* 9:30 AM, it applies to *today*. 
- If they attempt to mark it at 9:31 AM, the frontend physically disables "Today" options and the backend mathematically forces their payload to execute for *tomorrow*. This ensures absolute data integrity for the kitchen.

### 2. 👨‍💻 Standard User (The Employee)
The baseline account. Employees have a single, highly-focused dashboard.
- **Action:** They declare their status as `Office` (Needs Lunch), `Home` (No Lunch), or `Leave` (Away).
- **Vision:** They interact through a beautiful, color-coded React Calendar widget showing their exact historical footprint over the month.

### 3. 👨‍🍳 Logistics Manager (The Chef)
The Chef dashboard entirely abstracts complex data away and provides purely actionable real-time intel.
- **Action:** The Chef logs in after the 9:30 AM cutoff locking window.
- **Vision:** The MongoDB pipeline instantly groups and parses the entire company roster, spitting out a single, massive **Target Integer** representing exactly how many users selected `Office` for the exact current date. The Chef knows exactly how many meals to cook, permanently preventing massive food waste or accidental food shortages in the corporation.

### 4. 👑 System Executive (The Administrator)
The Admin dashboard is the 'God-Mode' omniscient observer.
- **Macro Analytics:** Admins see beautifully rendered Recharts.js line and pie graphs. Through high-speed MongoDB `$group` aggregation routes, they can visualize weekly trends (e.g., "Are more employees selecting `Home` on Fridays?").
- **Micro Intelligence:** Admins can query an exact date (e.g., "November 14th") and instantly see an immutable ledger proving exactly which individuals claimed which status.
- **Access Control:** Admins possess full User Lifecycle state-management. They can view the entire application database roster and dynamically click a dropdown to instantly elevate an `employee` into a `chef` or fellow `admin`.

---

## 🛡️ "Like a Boss" Security

This application has been relentlessly hardened against common web exploits:
- **Military-Grade Auth (Dual Token Rotation):** JWTs are physically split into two HttpOnly cookies. A heavy Vault Token lives strictly in the background for 7 days, constantly re-generating an ultra-short-lived 15-minute Access Token dynamically behind the scenes. This acts as a virtually unbreakable defense against Cross-Site Scripting (XSS) and Session Hijacking.
- **Strict Rate Limiting:** Global endpoints enforce a cap to neutralize data scrapers. The `login` and `register` endpoints strictly block IPs after **5 attempts per 15 minutes** to permanently shut down brute-force attacks.
- **Winston Crash Observability:** The server maps natively to a rotating `backend/logs` directory, permanently stamping and debugging Stack Traces via `winston-daily-rotate-file`.
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

## 🏢 Enterprise Production & Publishing Guide (For Companies)

If your company wants to adopt and publish this exact system for your own office, follow these 3 zero-downtime deployment steps:

### Phase 1: Database Setup (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a specific database user and whitelist the IP address `0.0.0.0/0` (allowing cloud servers to connect).
3. Copy your MongoDB Connection String (URI).

### Phase 2: Backend Publishing (Render)
1. Create a free account on [Render.com](https://render.com/).
2. Select **New Web Service** and connect your forked GitHub repository.
3. Render will instantly detect the `render.yaml` file natively included in this repository.
4. Go to **Environment Variables** on Render and explicitly paste your `MONGO_URI` and create two massive random string variables for `JWT_SECRET` and `JWT_REFRESH_SECRET`. 

### Phase 3: Frontend Publishing (Vercel/Netlify)
1. Create an account on [Vercel](https://vercel.com).
2. Import the `frontend/` folder of your GitHub repository.
3. In the Environment Variables tab, set `REACT_APP_API_URL` to point exactly to your new live Render Backend URL (e.g., `https://my-company-backend.onrender.com/api`).
4. Vercel will build the React app and automatically assign it a globally fast CDN URL.
5. *(Optional)* Add your company's custom `.com` domain name natively inside Vercel's Network settings!

---

## 🔐 Default Seed Users

On the initial server boot, the database identifies empty collections and dynamically populates default users so you can test all panels immediately:

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` |
| **Chef** | `chef@example.com` | `chef123` |
| **Employee** | `employee@example.com` | `employee123` |

---

## 🌐 OpenAPI Swagger Playground

If you want to manually test payloads without logging into the React UI or Postman, the backend automatically generates a beautiful Interactive Dashboard at:
`http://localhost:5000/api-docs`

## 📡 Complete REST API Ledger

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
