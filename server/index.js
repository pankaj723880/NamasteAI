// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// ✅ Use environment variable for port
const PORT = process.env.PORT || 5000;

// ✅ Use MongoDB Atlas connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatbot';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// Import routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { sendMessage } = require('./controllers/chatController');

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Legacy POST route
app.post('/chat', sendMessage);

// Socket.io setup
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-conversation', (conversationId) => socket.join(conversationId));
  socket.on('leave-conversation', (conversationId) => socket.leave(conversationId));

  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

// Make io accessible in routes
app.set('io', io);

// ✅ Export app for Vercel
module.exports = app;

// ✅ Start server only locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
  });
}
