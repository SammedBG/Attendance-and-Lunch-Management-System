#!/bin/bash

echo "Starting Lunch Attendance Management System..."
echo

echo "Starting Backend Server..."
cd backend && npm run dev &
BACKEND_PID=$!

echo "Waiting 3 seconds for backend to start..."
sleep 3

echo "Starting Frontend Application..."
cd ../frontend && npm start &
FRONTEND_PID=$!

echo
echo "Both applications are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both applications"

# Wait for user to stop
wait
