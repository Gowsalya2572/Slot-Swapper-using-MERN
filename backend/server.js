import dotenv from 'dotenv'
import express from 'express';
import http from 'http';
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from './routes/authRoutes.js';
import swapRoutes from './routes/swapRoutes.js';
import eventRoutes from './routes/eventRoutes.js'; // event CRUD routes, below


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', swapRoutes);

// health
app.get('/health', (req, res) => res.json({ ok: true, time: new Date() }));

// create server & socket.io
const server = http.createServer(app);
import { Server } from 'socket.io';
const io = new Server(server, {
  cors: { origin: ["https://slot-swapper-five-eta.vercel.app"], 
    methods: ["GET", "POST", "PUT", "DELETE"], },
});
global.io = io; // quick access from routes for emitting

// simple socket handling: register user socketId
import User from'./models/User.js';
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // client should emit 'register' with token or userId after login
  socket.on('register', async (payload) => {
    // payload could be { userId } or token
    try {
      if (!payload) return;
      if (payload.userId) {
        await User.findByIdAndUpdate(payload.userId, { socketId: socket.id });
      } else if (payload.token) {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(payload.token, process.env.JWT_SECRET);
        if (decoded && decoded.id) {
          await User.findByIdAndUpdate(decoded.id, { socketId: socket.id });
        }
      }
    } catch (err) {
      console.error('Socket register error', err.message);
    }
  });

  socket.on('disconnect', async () => {
    try {
      await User.updateMany({ socketId: socket.id }, { $unset: { socketId: '' } });
      console.log('Socket disconnected:', socket.id);
    } catch (err) {
      console.error('Disconnect cleanup error', err);
    }
  });
});

// connect to Mongo and start
const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI, { })
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connection error:', err);
    process.exit(1);
  });
