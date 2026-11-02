import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { GDSession, GDParticipant, AttendanceRecord } from '../models/index.js';
import { SOCKET_EVENTS } from 'hiresprint-shared';

const JWT_SECRET = process.env.JWT_SECRET || 'hiresprint-secure-development-jwt-secret-replace-in-production';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function setupSocketServer(io: Server) {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      socket.user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name || 'Student',
        role: decoded.role || 'STUDENT',
      };
      next();
    } catch (err: any) {
      next(new Error('Invalid socket authentication token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const currentUser = socket.user!;
    let currentRoomId: string | null = null;

    // Join meeting
    socket.on(SOCKET_EVENTS.MEETING_JOIN, async ({ roomId }) => {
      try {
        if (!roomId) return;
        const session = await GDSession.findById(roomId);
        if (!session) {
          socket.emit(SOCKET_EVENTS.MEETING_ERROR, { message: 'Session not found' });
          return;
        }

        currentRoomId = roomId;
        const socketRoom = `meeting:${roomId}`;
        socket.join(socketRoom);

        // Update or insert participant
        const participant = await GDParticipant.findOneAndUpdate(
          { sessionId: session._id, userId: currentUser.id },
          {
            sessionId: session._id,
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            socketId: socket.id,
            joinedAt: new Date(),
            leftAt: undefined,
          },
          { upsert: true, new: true }
        );

        // Fetch all active participants in this session
        const activeParticipants = await GDParticipant.find({
          sessionId: session._id,
          leftAt: { $exists: false },
        });

        // Notify other room members
        socket.to(socketRoom).emit(SOCKET_EVENTS.MEETING_PARTICIPANT_JOINED, {
          peerId: socket.id,
          user: currentUser,
          participant,
        });

        // Send room state and existing participants to the joined user
        socket.emit(SOCKET_EVENTS.MEETING_STATE, {
          session,
          participants: activeParticipants,
          peerId: socket.id,
        });
      } catch (err: any) {
        socket.emit(SOCKET_EVENTS.MEETING_ERROR, { message: err.message });
      }
    });

    // WebRTC Signaling: Offer
    socket.on(SOCKET_EVENTS.WEBRTC_OFFER, ({ target, offer }) => {
      if (!currentRoomId || !target) return;
      io.to(target).emit(SOCKET_EVENTS.WEBRTC_OFFER, {
        from: socket.id,
        offer,
        user: currentUser,
      });
    });

    // WebRTC Signaling: Answer
    socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, ({ target, answer }) => {
      if (!currentRoomId || !target) return;
      io.to(target).emit(SOCKET_EVENTS.WEBRTC_ANSWER, {
        from: socket.id,
        answer,
        user: currentUser,
      });
    });

    // WebRTC Signaling: ICE Candidate
    socket.on(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, ({ target, candidate }) => {
      if (!currentRoomId || !target) return;
      io.to(target).emit(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, {
        from: socket.id,
        candidate,
      });
    });

    // Meeting Chat
    socket.on(SOCKET_EVENTS.MEETING_CHAT, ({ text }) => {
      if (!currentRoomId || !text) return;
      const payload = {
        sender: currentUser.name,
        senderId: currentUser.id,
        text,
        timestamp: new Date().toISOString(),
      };
      io.to(`meeting:${currentRoomId}`).emit(SOCKET_EVENTS.MEETING_CHAT, payload);
    });

    // Media & UI Controls (Mute / Camera / Hand raise)
    socket.on(SOCKET_EVENTS.MEETING_HAND_RAISE, async ({ raised }) => {
      if (!currentRoomId) return;
      await GDParticipant.findOneAndUpdate(
        { sessionId: currentRoomId, userId: currentUser.id },
        { hasRaisedHand: raised }
      );
      io.to(`meeting:${currentRoomId}`).emit(SOCKET_EVENTS.MEETING_HAND_RAISE, {
        userId: currentUser.id,
        raised,
        userName: currentUser.name,
      });
    });

    // Leave Meeting
    const handleLeave = async () => {
      if (!currentRoomId) return;
      const roomId = currentRoomId;
      currentRoomId = null;

      try {
        const leaveTime = new Date();
        const participant = await GDParticipant.findOneAndUpdate(
          { sessionId: roomId, userId: currentUser.id },
          { leftAt: leaveTime }
        );

        if (participant) {
          const durationSeconds = Math.round((leaveTime.getTime() - new Date(participant.joinedAt).getTime()) / 1000);
          await AttendanceRecord.findOneAndUpdate(
            { sessionId: roomId, userId: currentUser.id },
            {
              sessionId: roomId,
              userId: currentUser.id,
              userName: currentUser.name,
              userEmail: currentUser.email,
              leaveTime,
              durationSeconds,
              status: durationSeconds > 60 ? 'PRESENT' : 'PARTIAL',
            },
            { upsert: true }
          );
        }

        io.to(`meeting:${roomId}`).emit(SOCKET_EVENTS.MEETING_PARTICIPANT_LEFT, {
          peerId: socket.id,
          userId: currentUser.id,
          userName: currentUser.name,
        });

        socket.leave(`meeting:${roomId}`);
      } catch (err) {
        console.error('[Socket Leave Error]:', err);
      }
    };

    socket.on(SOCKET_EVENTS.MEETING_LEAVE, handleLeave);
    socket.on('disconnect', handleLeave);
  });
}
