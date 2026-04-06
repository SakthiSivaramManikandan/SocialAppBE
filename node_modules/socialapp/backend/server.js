const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

process.on('uncaughtException', err => { console.error('Uncaught Exception:', err); process.exit(1); });
process.on('unhandledRejection', err => { console.error('Unhandled Rejection:', err); process.exit(1); });

const app = express();
app.set('trust proxy', 1);

// CORS — allow Netlify + localhost
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
// On Render free tier with disk, path is /opt/render/project/src/uploads
const uploadsPath = process.env.NODE_ENV === 'production'
  ? '/opt/render/project/src/uploads'
  : path.join(__dirname, 'uploads');

app.use('/uploads', express.static(uploadsPath));

// Health check (required for Render)
app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/posts',         require('./routes/posts'));
app.use('/api/comments',      require('./routes/comments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/stories',       require('./routes/stories'));
app.use('/api/friends',       require('./routes/friends'));

// 404 handler
app.use('/api/*', (req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Connect MongoDB then start
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/socialapp')
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () =>
      console.log(`🚀 Server on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
    );
  })
  .catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });
