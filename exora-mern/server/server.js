const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const { connectToDatabase, getDbHealth } = require('./config/db');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

// Load env from server/.env first, then fall back to project root .env
dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.MONGO_URI || !process.env.PORT) {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
}

const app = express();
let io = null;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/discovery', require('./routes/discovery'));
app.use('/api/workflows', require('./routes/workflows'));

app.get('/health', async (req, res) => {
  try {
    await connectToDatabase();
    const db = await getDbHealth();
    res.status(200).json({ ok: true, service: 'server', db });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    // Socket.IO setup
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: '*',
      },
    });

    io.on('connection', (socket) => {
      // Optional: authenticate user via token if needed
      socket.on('subscribe:dashboard', (userId) => {
        if (userId) socket.join(`dashboard:${userId}`);
      });
      socket.on('disconnect', () => {});
    });

    // Expose a simple emitter for controllers
    app.set('io', io);
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  });

