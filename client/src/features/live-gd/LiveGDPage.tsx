import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../../services/api';
import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from 'hiresprint-shared';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Hand,
  MessageSquare,
  LogOut,
  Users,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
} from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const LiveGDPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // If no sessionId is in URL, render the Room Selector
  if (!sessionId) {
    return <LiveGDRoomSelector />;
  }

  return <LiveGDMeetingRoom sessionId={sessionId} />;
};

function LiveGDRoomSelector() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    api.get('/gd/sessions?type=LIVE_GD').then((res) => setSessions(res.sessions || [])).catch(() => {});
  }, []);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const found = sessions.find((s) => s.joinCode === joinCode.trim().toUpperCase());
    if (found) {
      navigate(`/gd/live/${found._id}`);
    } else {
      alert('No meeting found with this join code.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          <Video size={14} />
          <span>Real-Time WebRTC Group Discussions</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Live GD Meeting Rooms
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Join peer-to-peer audio/video discussions with real-time AI moderation, live transcription, and university attendance logging.
        </p>
      </div>

      {/* Join with code box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Have a Meeting Join Code?</h3>
        <form onSubmit={handleJoinByCode} className="mt-3 flex gap-3 max-w-md">
          <input
            type="text"
            required
            placeholder="e.g. CX492A"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-mono uppercase outline-none focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Enter Room
          </button>
        </form>
      </div>

      {/* Available Live Sessions Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Scheduled Live GD Sessions</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sessions.map((s) => (
            <div
              key={s._id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {s.status}
                  </span>
                  <span className="font-mono text-slate-400">Code: {s.joinCode}</span>
                </div>
                <h4 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{s.title}</h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  Topic: {s.topicTitle}
                </p>
                <div className="mt-3 flex items-center space-x-4 text-xs text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Clock size={13} />
                    <span>{s.durationMinutes} mins</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users size={13} />
                    <span>Max {s.maxParticipants}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/gd/live/${s._id}`)}
                className="mt-5 flex items-center justify-center space-x-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                <Play size={13} />
                <span>Join Waiting Room</span>
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="col-span-2 py-8 text-center text-xs text-slate-400">
              No live GD rooms available right now. Teachers or Coordinators can schedule one from their dashboards.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function LiveGDMeetingRoom({ sessionId }: { sessionId: string }) {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [inWaitingRoom, setInWaitingRoom] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'transcript'>('transcript');

  // WebRTC & Streams
  const [peers, setPeers] = useState<{ [peerId: string]: { user: any; stream: MediaStream } }>({});
  const [chats, setChats] = useState<any[]>([]);
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [moderatorNotice, setModeratorNotice] = useState<string | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnections = useRef<{ [peerId: string]: RTCPeerConnection }>({});
  const socketRef = useRef<Socket | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Load session info
    api.get(`/gd/sessions/${sessionId}`).then((res) => {
      setSession(res.session);
    }).catch(() => {});

    // Request initial device preview
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.warn('Microphone/Camera permission not granted:', err);
      });

    return () => {
      // Cleanup tracks on unmount
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      socketRef.current?.disconnect();
    };
  }, [sessionId]);

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const handleEnterMeeting = () => {
    setInWaitingRoom(false);

    // Initialize authenticated socket
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit(SOCKET_EVENTS.MEETING_JOIN, { roomId: sessionId });
    });

    socket.on(SOCKET_EVENTS.MEETING_STATE, ({ participants, transcripts: existingTranscripts }) => {
      setTranscripts(existingTranscripts || []);
    });

    // Participant joined -> create peer connection and send offer
    socket.on(SOCKET_EVENTS.MEETING_PARTICIPANT_JOINED, async ({ peerId, user: remoteUser }) => {
      const pc = createPeerConnection(peerId, remoteUser);
      peerConnections.current[peerId] = pc;

      // Add local tracks
      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit(SOCKET_EVENTS.WEBRTC_OFFER, {
        target: peerId,
        offer,
      });
    });

    // Received WebRTC Offer -> answer
    socket.on(SOCKET_EVENTS.WEBRTC_OFFER, async ({ from, offer, user: remoteUser }) => {
      const pc = createPeerConnection(from, remoteUser);
      peerConnections.current[from] = pc;

      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit(SOCKET_EVENTS.WEBRTC_ANSWER, {
        target: from,
        answer,
      });
    });

    // Received WebRTC Answer
    socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, async ({ from, answer }) => {
      const pc = peerConnections.current[from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // Received ICE Candidate
    socket.on(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, async ({ from, candidate }) => {
      const pc = peerConnections.current[from];
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // Chat received
    socket.on(SOCKET_EVENTS.MEETING_CHAT, (chat) => {
      setChats((prev) => [...prev, chat]);
    });

    // Transcript received
    socket.on(SOCKET_EVENTS.MEETING_TRANSCRIPT, (segment) => {
      setTranscripts((prev) => [...prev, segment]);
    });

    // AI Moderator Event
    socket.on(SOCKET_EVENTS.MEETING_MODERATOR_EVENT, ({ message, segment }) => {
      setModeratorNotice(message);
      if (segment) {
        setTranscripts((prev) => [...prev, segment]);
      }
      setTimeout(() => setModeratorNotice(null), 10000);
    });

    // Peer Left
    socket.on(SOCKET_EVENTS.MEETING_PARTICIPANT_LEFT, ({ peerId }) => {
      if (peerConnections.current[peerId]) {
        peerConnections.current[peerId].close();
        delete peerConnections.current[peerId];
      }
      setPeers((prev) => {
        const next = { ...prev };
        delete next[peerId];
        return next;
      });
    });

    // Start live speech-to-text recognition
    startLiveSpeechRecognition(socket);
  };

  const createPeerConnection = (peerId: string, remoteUser: any) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, {
          target: peerId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setPeers((prev) => ({
        ...prev,
        [peerId]: {
          user: remoteUser,
          stream: event.streams[0],
        },
      }));
    };

    return pc;
  };

  // Browser Speech-to-Text streaming
  const startLiveSpeechRecognition = (socket: Socket) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      const isFinal = event.results[current].isFinal;

      if (isFinal && text.trim().length > 3) {
        socket.emit(SOCKET_EVENTS.MEETING_TRANSCRIPT, {
          text: text.trim(),
          isFinal: true,
        });
      }
    };

    recognition.onerror = () => {};
    recognition.onend = () => {
      // Auto restart to maintain live transcription
      try {
        recognition.start();
      } catch {}
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch {}
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socketRef.current?.emit(SOCKET_EVENTS.MEETING_CHAT, { text: chatInput.trim() });
    setChatInput('');
  };

  const toggleHandRaise = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    socketRef.current?.emit(SOCKET_EVENTS.MEETING_HAND_RAISE, { raised: nextState });
  };

  const handleLeaveMeeting = () => {
    if (confirm('Leave this live group discussion? Your attendance duration will be logged.')) {
      socketRef.current?.emit(SOCKET_EVENTS.MEETING_LEAVE, { roomId: sessionId });
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      navigate('/student/dashboard');
    }
  };

  // WAITING ROOM SCREEN
  if (inWaitingRoom) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 pt-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Meeting Waiting Room
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {session?.title || 'Live Group Discussion'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Topic: {session?.topicTitle}
          </p>
        </div>

        {/* Video Preview Box */}
        <div className="relative mx-auto aspect-video max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-xl dark:border-slate-800">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            {user?.name} (You)
          </div>

          <div className="absolute bottom-3 right-3 flex space-x-2">
            <button
              onClick={toggleAudio}
              className={`rounded-full p-2.5 transition-colors ${
                isAudioOn ? 'bg-white/20 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {isAudioOn ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
            <button
              onClick={toggleVideo}
              className={`rounded-full p-2.5 transition-colors ${
                isVideoOn ? 'bg-white/20 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}
            </button>
          </div>
        </div>

        {/* Join button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleEnterMeeting}
            className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-700"
          >
            <span>Enter Meeting Room</span>
          </button>
        </div>
      </div>
    );
  }

  // LIVE MEETING ROOM SCREEN
  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col space-y-4">
      {/* AI Moderator Alert Banner */}
      {moderatorNotice && (
        <div className="flex items-center space-x-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs text-indigo-950 shadow-sm dark:border-indigo-900 dark:bg-indigo-950/70 dark:text-indigo-200 animate-fade-in">
          <Sparkles size={18} className="shrink-0 text-indigo-600 dark:text-indigo-400" />
          <div className="flex-1">
            <span className="font-bold">AI Moderator Guidance: </span>
            <span>{moderatorNotice}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Video Grid (Left) + Chat/Transcript (Right) */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-12">
        {/* Video Mesh Grid */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-900 p-4 shadow-sm dark:border-slate-800 lg:col-span-8">
          {/* Video Grid Tiles */}
          <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-1">
            {/* Local Video Tile */}
            <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-800 border border-slate-700">
              <video
                ref={(el) => {
                  if (el && localStreamRef.current) el.srcObject = localStreamRef.current;
                }}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-2 left-2 flex items-center space-x-1.5 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                <span>{user?.name} (You)</span>
                {!isAudioOn && <MicOff size={12} className="text-rose-400" />}
              </div>
              {isHandRaised && (
                <div className="absolute top-2 right-2 rounded-full bg-amber-500 p-1.5 text-white">
                  <Hand size={14} />
                </div>
              )}
            </div>

            {/* Remote Peer Video Tiles */}
            {Object.entries(peers).map(([peerId, peerData]) => (
              <div
                key={peerId}
                className="relative aspect-video overflow-hidden rounded-xl bg-slate-800 border border-slate-700"
              >
                <video
                  ref={(el) => {
                    if (el) el.srcObject = peerData.stream;
                  }}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                  {peerData.user?.name || 'Peer Candidate'}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Meeting Controls Bar */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-3">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="font-semibold text-white">{session?.title}</span>
              <span>•</span>
              <span>{Object.keys(peers).length + 1} Connected</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleAudio}
                className={`rounded-xl p-2.5 text-xs font-semibold transition-colors ${
                  isAudioOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
              >
                {isAudioOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>

              <button
                onClick={toggleVideo}
                className={`rounded-xl p-2.5 text-xs font-semibold transition-colors ${
                  isVideoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
              >
                {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>

              <button
                onClick={toggleHandRaise}
                className={`rounded-xl p-2.5 text-xs font-semibold transition-colors ${
                  isHandRaised ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Raise Hand"
              >
                <Hand size={18} />
              </button>

              <button
                onClick={handleLeaveMeeting}
                className="flex items-center space-x-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-rose-700"
              >
                <LogOut size={16} />
                <span>Leave</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Transcript & Meeting Chat Tabs */}
        <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-4">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 p-2 text-xs font-semibold dark:border-slate-800">
            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex-1 rounded-lg py-2 transition-colors ${
                activeTab === 'transcript'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Live Transcript
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 rounded-lg py-2 transition-colors ${
                activeTab === 'chat'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Meeting Chat ({chats.length})
            </button>
          </div>

          {/* Transcript Feed */}
          {activeTab === 'transcript' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {transcripts.map((t, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl p-3 text-xs ${
                    t.isAi
                      ? 'border border-indigo-100 bg-indigo-50/70 dark:border-indigo-900 dark:bg-indigo-950/40'
                      : 'border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {t.speakerName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200">{t.text}</p>
                </div>
              ))}
              {transcripts.length === 0 && (
                <p className="py-8 text-center text-xs text-slate-400">
                  Live speech transcription active. Speak into your microphone to add points.
                </p>
              )}
            </div>
          )}

          {/* In-Meeting Chat Feed */}
          {activeTab === 'chat' && (
            <div className="flex flex-1 flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chats.map((c, idx) => (
                  <div key={idx} className="rounded-xl bg-slate-50 p-2.5 text-xs dark:bg-slate-800/50">
                    <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                      <span>{c.sender}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-800 dark:text-slate-200">{c.text}</p>
                  </div>
                ))}
                {chats.length === 0 && (
                  <p className="py-8 text-center text-xs text-slate-400">No chat messages yet.</p>
                )}
              </div>

              <form onSubmit={handleSendChat} className="border-t border-slate-100 p-3 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Send in-meeting message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
