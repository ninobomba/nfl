#!/bin/bash

echo "Stopping NFL App Services..."

# Function to kill process by port
kill_port() {
    PORT=$1
    PID=$(lsof -t -i:"$PORT")
    if [ -n "$PID" ]; then
        echo "Killing process on port $PORT (PID: $PID)..."
        kill -9 "$PID"
    else
        echo "No process found on port $PORT"
    fi
}

# 1. Kill by Port
kill_port 3000  # Server
kill_port 5173  # Client (Vite)

# 2. Kill by Name (fallback/cleanup)
echo "Cleaning up remaining Node/Vite processes..."
pkill -f "vite"
pkill -f "tsx watch"
pkill -f "nodemon"

echo "All services stopped."
