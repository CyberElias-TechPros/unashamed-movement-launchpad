const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = (process.env.CORS_ORIGINS || 'http://localhost:8080,http://localhost:5173')
      .split(',')
      .map((o) => o.trim());

    if (!origin || allowed.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

module.exports = cors(corsOptions);
