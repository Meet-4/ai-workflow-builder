import mongoose from "mongoose";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  /** Timestamp (ms) when the last connection attempt failed */
  failedAt: number | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached = (global.mongoose || {
  conn: null,
  promise: null,
  failedAt: null,
}) as MongooseCache;

if (!global.mongoose) {
  global.mongoose = cached;
}

// How long (ms) to wait before retrying a failed connection attempt.
// Avoids hammering the network on every request when Atlas is unreachable.
const RETRY_AFTER_MS = 30_000;

export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }

  // Return cached connection immediately if available
  if (cached.conn) {
    return cached.conn;
  }

  // If a recent attempt already failed, throw right away without a new DNS lookup
  if (cached.failedAt && Date.now() - cached.failedAt < RETRY_AFTER_MS) {
    throw new Error("MongoDB unavailable (cached failure — skipping retry)");
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Fail fast so page renders aren't blocked for 30 s
      serverSelectionTimeoutMS: 5_000,
      connectTimeoutMS: 5_000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      cached.failedAt = null; // clear any previous failure on success
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.failedAt = Date.now(); // remember that it failed
    throw e;
  }

  return cached.conn;
}
