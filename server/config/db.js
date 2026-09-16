const mongoose = require('mongoose');
const path = require('path');

let memoryServer = null;
let usingMemoryMongo = false;

/**
 * Connect to MongoDB.
 *
 * Production requires MONGODB_URI. In development, when MONGODB_URI is unset
 * or unreachable, we transparently boot an in-process, wire-protocol
 * compatible in-memory MongoDB (server/dev/memoryMongo.js) so the whole stack
 * works end-to-end with zero external services. Its data is snapshotted to
 * server/.devdb.json so dev data survives restarts; delete that file for a
 * clean slate.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const isProd = process.env.NODE_ENV === 'production';
  const forceMemory = process.env.USE_MEMORY_MONGO === '1' || process.env.USE_MEMORY_MONGO === 'true';

  if (uri && !forceMemory) {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return { memory: false };
    } catch (error) {
      if (isProd) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      }
      console.warn(`Could not reach MONGODB_URI (${error.message}). Falling back to in-memory MongoDB for development.`);
      await mongoose.disconnect().catch(() => {});
    }
  } else if (!uri && isProd) {
    console.error('MONGODB_URI environment variable is required in production');
    process.exit(1);
  }

  const { startMemoryMongo } = require('../dev/memoryMongo');
  const dataDir = path.join(__dirname, '..');
  const persistPath = path.join(dataDir, '.devdb.json');
  memoryServer = await startMemoryMongo({
    port: Number(process.env.DEV_MONGO_PORT || 27017),
    persistPath,
  });
  const conn = await mongoose.connect(`${memoryServer.uri}/ttin`, {
    serverSelectionTimeoutMS: 5000,
  });
  usingMemoryMongo = true;
  console.log(`MongoDB Connected (in-memory dev): ${conn.connection.host}`);

  // Auto-seed empty dev databases so every screen has content.
  try {
    const Product = require('../models/Product');
    const hasProducts = await Product.estimatedDocumentCount();
    if (!hasProducts) {
      const { seedDatabase } = require('../scripts/seed');
      await seedDatabase({ wipe: false });
    }
  } catch (e) {
    console.warn('Dev auto-seed failed:', e.message);
  }

  return { memory: true };
};

const isMemoryMongo = () => usingMemoryMongo;

module.exports = connectDB;
module.exports.isMemoryMongo = isMemoryMongo;
