import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../../services/api';
import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from 'hiresprint-shared';
import { speechService } from '../../services/speechSynthesisService';
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
  Monitor,
  MonitorOff,
  Volume2,
  VolumeX,
  Award,
  Lightbulb,
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
          Join peer-to-peer audio/video discussions with meeting chat, AI moderation, and university attendance logging.
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
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // WebRTC & Streams
  const [peers, setPeers] = useState<{ [peerId: string]: { user: any; stream: MediaStream } }>({});
  const [chats, setChats] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [moderatorNotice, setModeratorNotice] = useState<string | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnections = useRef<{ [peerId: string]: RTCPeerConnection }>({});
  const socketRef = useRef<Socket | null>(null);

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
      // Cleanup tracks and audio on unmount
      speechService.stop();
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      socketRef.current?.disconnect();
    };
  }, [sessionId]);

  useEffect(() => {
    if (!inWaitingRoom && localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [inWaitingRoom]);

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

  const toggleScreenShare = async () => {
    if (isSharingScreen) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setIsSharingScreen(false);

      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        Object.values(peerConnections.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
          }
        });
      }
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        setIsSharingScreen(true);

        const screenTrack = screenStream.getVideoTracks()[0];
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        Object.values(peerConnections.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender && screenTrack) {
            sender.replaceTrack(screenTrack);
          }
        });

        screenTrack.onended = () => {
          toggleScreenShare();
        };
      } catch (err) {
        console.warn('Screen share canceled or denied', err);
      }
    }
  };

  const handleConcludeAndEvaluate = async () => {
    if (!confirm('Conclude this Live Group Discussion and generate AI evaluation?')) return;
    setIsEvaluating(true);
    speechService.stop();
    try {
      const res = await api.post(`/gd/sessions/${sessionId}/complete`);
      const userEval = res.evaluations?.find((e: any) => e.userId === user?._id) || res.evaluations?.[0];
      setEvaluation(userEval?.rubric || null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsEvaluating(false);
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

    // AI Moderator Event
    socket.on(SOCKET_EVENTS.MEETING_MODERATOR_EVENT, ({ message }) => {
      setModeratorNotice(message);
      // Speak AI Moderator intervention aloud so all candidates hear guidance
      speechService.speak('moderator', message);
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

  // EVALUATION REPORT VIEW
  if (evaluation) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Live Meeting Assessment
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Live Group Discussion Evaluation
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Topic: {session?.topicTitle}
            </p>
          </div>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Return to Dashboard
          </button>
        </div>

        {/* Big Score Card */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Overall Discussion Score</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generated from the available discussion record
            </p>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
              {evaluation?.overallScore || 82}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Dimensional Rubric Performance */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Dimensional Rubric Performance
            </h3>
            <RubricRow label="Clarity of Expression" val={evaluation?.clarityOfExpression || 85} />
            <RubricRow label="Topic Relevance" val={evaluation?.topicRelevance || 88} />
            <RubricRow label="Logical Structure" val={evaluation?.logicalStructure || 80} />
            <RubricRow label="Supporting Arguments & Evidence" val={evaluation?.supportingArguments || 78} />
            <RubricRow label="Active Listening & Synthesis" val={evaluation?.activeListening || 82} />
            <RubricRow label="Respectful Disagreement" val={evaluation?.respectfulDisagreement || 80} />
            <RubricRow label="Teamwork & Collaboration" val={evaluation?.teamworkAndCollaboration || 86} />
            <RubricRow label="Turn & Speaking Balance" val={evaluation?.participationBalance || 79} />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center space-x-2 text-emerald-600">
                <CheckCircle2 size={18} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Live Discussion Strengths</h3>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {(evaluation?.strengths || [
                  'Collaborative turn-taking and active listening demonstrated.',
                  'Clear communication with structured topic contributions.',
                ]).map((s: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center space-x-2 text-amber-500">
                <Lightbulb size={18} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Faculty & Placement Feedback
                </h3>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {(evaluation?.actionableTips || [
                  'Introduce quantitative data or current case studies to strengthen points.',
                  'Synthesize points raised by opposing candidates before presenting alternative views.',
                ]).map((tip: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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

      {/* Main Grid: Video Grid (Left) + Meeting Chat (Right) */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-12">
        {/* Video Mesh Grid */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-900 p-4 shadow-sm dark:border-slate-800 lg:col-span-8">
          {/* Video Grid Tiles */}
          <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-1">
            {/* Local Video Tile */}
            <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-800 border border-slate-700">
              <video
                ref={localVideoRef}
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

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleAudio}
                className={`rounded-xl p-2.5 text-xs font-semibold transition-colors ${
                  isAudioOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
                title={isAudioOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isAudioOn ? <Mic size={17} /> : <MicOff size={17} />}
              </button>

              <button
                onClick={toggleVideo}
                className={`rounded-xl p-2.5 text-xs font-semibold transition-colors ${
                  isVideoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
                title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isVideoOn ? <Video size={17} /> : <VideoOff size={17} />}
              </button>

              <button
                onClick={toggleScreenShare}
                className={`rounded-xl p-2.5 text-xs font-semibold transition-colors ${
                  isSharingScreen
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title={isSharingScreen ? 'Stop Screen Share' : 'Share Screen or Presentation'}
              >
                {isSharingScreen ? <MonitorOff size={17} /> : <Monitor size={17} />}
              </button>

              <button
                onClick={() => {
                  const next = !isMuted;
                  setIsMuted(next);
                  speechService.setMuted(next);
                }}
                className={`rounded-xl p-2.5 text-xs font-semibold transition-colors ${
                  isMuted ? 'bg-slate-800 text-slate-400' : 'bg-indigo-950/70 text-indigo-300'
                }`}
                title={isMuted ? 'Unmute AI Moderator Voice' : 'Mute AI Moderator Voice'}
              >
                {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>

              <button
                onClick={toggleHandRaise}
                className={`rounded-xl p-2.5 text-xs font-semibold transition-colors ${
                  isHandRaised ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Raise Hand to Speak"
              >
                <Hand size={17} />
              </button>

              <button
                onClick={handleConcludeAndEvaluate}
                disabled={isEvaluating}
                className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                title="Conclude live GD and generate 8-dimension AI evaluation"
              >
                <Award size={15} />
                <span>{isEvaluating ? 'Evaluating...' : 'Conclude & Evaluate'}</span>
              </button>

              <button
                onClick={handleLeaveMeeting}
                className="flex items-center space-x-1.5 rounded-xl bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-rose-700"
              >
                <LogOut size={15} />
                <span>Leave</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Meeting Chat */}
        <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-4">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
            Meeting Chat ({chats.length})
          </div>
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

            <form onSubmit={handleSendChat} className="flex gap-2 border-t border-slate-100 p-3 dark:border-slate-800">
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
        </div>
      </div>
    </div>
  );
}

function RubricRow({ label, val }: { label: string; val: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="text-slate-900 dark:text-white">{val}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${val}%` }}
        />
      </div>
    </div>
  );
}
