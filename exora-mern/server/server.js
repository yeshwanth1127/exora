const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const { connectToDatabase, getDbHealth } = require('./config/db');

// Load env from server/.env first, then fall back to project root .env
dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.MONGO_URI || !process.env.PORT) {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
}

const app = express();

app.use(cors());
app.use(express.json());

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
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  });

