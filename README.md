# Lunch & Attendance Management System

A web-based application to manage employee attendance and facilitate lunch planning for organizations. This project provides separate dashboards for Employees, Chefs, and Admins.

## Features

### Employee Dashboard

- Mark attendance (`office`, `home`, or `leave`).
- View and update attendance on a calendar.
- Cutoff time enforcement for same-day attendance submission (9:30 AM).

### Chef Dashboard

- View daily employee count for on-site attendance.
- Receive scheduled notifications at 9:30 AM to plan lunch.

### Admin Dashboard

- View detailed daily attendance reports.
- Visualize attendance trends over time.
- Manage user accounts and update roles.

## Tech Stack

- **Frontend:**

  - [React](https://reactjs.org/) ([src/App.tsx](src/App.tsx))
  - [Vite](https://vitejs.dev/) ([vite.config.ts](vite.config.ts))
  - [Tailwind CSS](https://tailwindcss.com/) ([tailwind.config.js](tailwind.config.js))
  - [React Router](https://reactrouter.com/) ([src/App.tsx](src/App.tsx))
  - [Recharts](https://recharts.org/)

- **Backend:**

  - [Express](https://expressjs.com/) ([server/index.js](server/index.js))
  - [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
  - [JWT](https://jwt.io/) for authentication
  - [Node-Cron](https://npmjs.com/package/node-cron) for scheduled tasks

- **Utilities:**
  - [date-fns](https://date-fns.org/) for date handling
  - [axios](https://axios-http.com/) for API calls

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- MongoDB (local installation or a cloud instance)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-repo/lunch-attendance-system.git
   cd lunch-attendance-system
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add the following variables:

   ```
   PORT=5000
   JWT_SECRET=your_jwt_secret
   MONGO_URI=mongodb://localhost:27017/lunch-attendance
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

## Project Structure

```
.
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── server/
│   └── index.js
└── src/
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── vite-env.d.ts
    ├── components/
    │   ├── admin/
    │   │   ├── AttendanceReport.tsx
    │   │   ├── AttendanceStats.tsx
    │   │   └── UserManagement.tsx
    │   ├── common/
    │   │   └── ProtectedRoute.tsx
    │   └── employee/
    │       ├── AttendanceCalendar.tsx
    │       └── AttendanceForm.tsx
    ├── contexts/
    │   └── AuthContext.tsx
    ├── pages/
    │   ├── AdminDashboard.tsx
    │   ├── ChefDashboard.tsx
    │   ├── EmployeeDashboard.tsx
    │   └── Login.tsx
    └── services/
        └── api.ts
```
License
This project is licensed under the MIT License. See the LICENSE file for details.