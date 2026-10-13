import http from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { connectDB } from './config/db.js';
import { setupSocketServer } from './socket/index.js';

const PORT = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

setupSocketServer(io);

async function start() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`[HireSprint Server] Running on http://localhost:${PORT}`);
      console.log(`[HireSprint Server] Allowed client origin: ${clientOrigin}`);
    });
  } catch (err: any) {
    console.error('[HireSprint Server] Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
