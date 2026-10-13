import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hiresprint';

  try {
    // Attempt standard connection first with 3s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected successfully to MongoDB at ${uri}`);
    return mongoose;
  } catch (err: any) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Database] Failed to connect to production MongoDB URI:', err.message);
      throw err;
    }

    console.warn(`[Database] Standalone MongoDB connection failed (${err.message}). Starting embedded in-memory MongoDB for local development...`);
    try {
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Connected to embedded in-memory MongoDB at ${memUri}`);
      return mongoose;
    } catch (memErr: any) {
      console.error('[Database] Failed to start embedded in-memory MongoDB:', memErr.message);
      throw memErr;
    }
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
