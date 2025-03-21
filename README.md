# Collaborative Whiteboard Application

A real-time collaborative whiteboard application built with React, Node.js, and Socket.IO.

## Features

- Real-time drawing collaboration
- Multiple drawing tools (brush, line, rectangle, circle, arrow, text)
- Color and size customization
- User authentication
- Canvas sharing
- Save and load functionality
- Undo/Redo operations

## Tech Stack

### Frontend
- React
- Socket.IO Client
- TailwindCSS
- Perfect Freehand
- RoughJS

### Backend
- Node.js
- Express
- MongoDB
- Socket.IO
- JWT Authentication

## Installation and Setup

### Prerequisites
- Node.js
- MongoDB

### Backend Setup
```bash
cd Backend
npm install
```

Create a `.env` file in the Backend directory with:
```
MONGO_URI=your_mongodb_connection_string
PORT=3030
JWT_SECRET=your_secret_key
```

### Frontend Setup
```bash
cd Frontend/whiteboard-tutorial
npm install
```

## Running the Application

### Start the Backend
```bash
cd Backend
npm run dev
```

### Start the Frontend
```bash
cd Frontend/whiteboard-tutorial
npm start
```

Open [http://localhost:3000](http://localhost:3000) to use the application.