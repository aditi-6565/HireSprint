import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../../services/api';
import { AI_PERSONAS, AIPersonaConfig } from 'hiresprint-shared';
import {
  Sparkles,
  Play,
  Mic,
  MicOff,
  Send,
  Users,
  Award,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const AIPracticePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<'setup' | 'active' | 'evaluation'>('setup');
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(location.state?.selectedTopicId || '');
  const [customTopic, setCustomTopic] = useState('');
  const [duration, setDuration] = useState(10);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([
    'confident_communicator',
    'analytical_thinker',
    'data_speaker',
    'respectful_challenger',
  ]);

  // Session state
  const [session, setSession] = useState<any>(null);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<string>('ai-moderator');
  const [isMicOn, setIsMicOn] = useState(false);
  const [studentInput, setStudentInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/lms/topics').then((res) => {
      setTopics(res.topics || []);
      if (!selectedTopicId && res.topics?.length > 0) {
        setSelectedTopicId(res.topics[0]._id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const togglePersona = (id: string) => {
    if (selectedPersonas.includes(id)) {
      if (selectedPersonas.length <= 2) return; // Keep at least 2
      setSelectedPersonas(selectedPersonas.filter((p) => p !== id));
    } else {
      setSelectedPersonas([...selectedPersonas, id]);
    }
  };

  const handleStartDiscussion = async () => {
    try {
      const chosen = topics.find((t) => t._id === selectedTopicId);
      const topicTitle = customTopic.trim() || chosen?.title || 'AI in University Education';

      const res = await api.post('/gd/sessions', {
        title: `AI Practice - ${topicTitle}`,
        topicId: selectedTopicId || undefined,
        topicTitle,
        sessionType: 'AI_PRACTICE',
        durationMinutes: duration,
        selectedPersonas,
      });

      setSession(res.session);

      // Fetch initial details which include the AI moderator intro
      const details = await api.get(`/gd/sessions/${res.session._id}`);
      setTranscript(details.transcript || []);
      setActiveSpeaker('ai-moderator');
      setStep('active');

      // Trigger first persona to speak after 1.5 seconds
      setTimeout(() => {
        triggerAiTurn(res.session._id);
      }, 1500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const triggerAiTurn = async (sessionId: string) => {
    setIsAiThinking(true);
    try {
      const res = await api.post(`/gd/sessions/${sessionId}/ai-turn`);
      setTranscript((prev) => [...prev, res.segment]);
      setActiveSpeaker(res.segment.speakerId);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleSendTurn = async () => {
    if (!studentInput.trim() || !session) return;
    const textToSend = studentInput.trim();
    setStudentInput('');
    setActiveSpeaker('student');

    try {
      const res = await api.post(`/gd/sessions/${session._id}/turn`, {
        text: textToSend,
        source: 'typed_input',
      });
      setTranscript((prev) => [...prev, res.segment]);

      // Trigger AI persona response
      setTimeout(() => {
        triggerAiTurn(session._id);
      }, 1200);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Speech Recognition (Web Speech API)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Edge or type your response below.');
      return;
    }

    if (isMicOn) {
      recognitionRef.current?.stop();
      setIsMicOn(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsMicOn(true);
    recognition.onend = () => setIsMicOn(false);

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setStudentInput(transcriptText);

      if (event.results[current].isFinal) {
        setIsMicOn(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleEndSession = async () => {
    if (!session) return;
    try {
      const res = await api.post(`/gd/sessions/${session._id}/complete`);
      const userEval = res.evaluations?.find((e: any) => e.userId === user?._id) || res.evaluations?.[0];
      setEvaluation(userEval?.rubric || null);
      setStep('evaluation');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // SETUP SCREEN
  if (step === 'setup') {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <Sparkles size={14} />
            <span>Autonomous Multi-Agent Practice</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Group Discussion Practice Lab
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure your discussion topic, select conversational personas, and practice structuring arguments with instant multi-dimensional evaluation.
          </p>
        </div>

        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Topic Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Choose Discussion Topic
            </label>
            <div className="mt-2 space-y-2">
              <select
                value={selectedTopicId}
                onChange={(e) => {
                  setSelectedTopicId(e.target.value);
                  setCustomTopic('');
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              >
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    [{t.difficulty}] {t.title}
                  </option>
                ))}
              </select>

              <div className="text-center text-xs text-slate-400 font-semibold">— OR TYPE CUSTOM TOPIC —</div>
              <input
                type="text"
                placeholder="Custom topic, e.g. Impact of Quantum Computing on Data Privacy..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* AI Persona Selection */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Select AI Personas ({selectedPersonas.length} chosen)
              </label>
              <span className="text-xs text-slate-400">Select at least 2 distinct personas</span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Object.values(AI_PERSONAS).map((p: AIPersonaConfig) => {
                const isSelected = selectedPersonas.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => togglePersona(p.id)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/40'
                        : 'border-slate-200 bg-slate-50 opacity-60 hover:opacity-100 dark:border-slate-800 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {p.name}
                      </span>
                      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        {p.initials}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {p.role}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 dark:text-slate-400">
                      {p.style}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Duration & Rules */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Session Duration
            </label>
            <div className="mt-2 flex gap-3">
              {[5, 10, 15].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                    duration === d
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {d} Minutes
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleStartDiscussion}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-700"
            >
              <Play size={18} />
              <span>Begin AI Group Discussion</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE DISCUSSION STAGE
  if (step === 'active') {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
        {/* Top Discussion Header */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              AI Discussion In Progress
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {session?.topicTitle}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleEndSession}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
            >
              Conclude & Evaluate
            </button>
          </div>
        </div>

        {/* Stage & Live Transcript Columns */}
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-12">
          {/* Left: Persona Orbit & Stage Status */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold border-b border-slate-100 pb-3 dark:border-slate-800">
                <span>STAGE PARTICIPANTS</span>
                <span>{selectedPersonas.length + 1} candidates</span>
              </div>

              {/* Persona Nodes Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {selectedPersonas.map((pId) => {
                  const p = AI_PERSONAS[pId];
                  const isSpeaking = activeSpeaker === `ai-${pId}`;
                  return (
                    <div
                      key={pId}
                      className={`relative flex items-center space-x-3 rounded-xl border p-3 transition-all ${
                        isSpeaking
                          ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/60'
                          : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white text-xs">
                        {p.initials}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-xs text-slate-900 truncate dark:text-white">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{p.role}</p>
                      </div>

                      {/* Speaking indicator wave */}
                      {isSpeaking && (
                        <div className="absolute right-3 flex items-center space-x-0.5">
                          <span className="w-1 bg-indigo-600 rounded-full animate-wave-1 dark:bg-indigo-400" />
                          <span className="w-1 bg-indigo-600 rounded-full animate-wave-2 dark:bg-indigo-400" />
                          <span className="w-1 bg-indigo-600 rounded-full animate-wave-3 dark:bg-indigo-400" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Student's Node */}
                <div
                  className={`relative flex items-center space-x-3 rounded-xl border p-3 transition-all ${
                    activeSpeaker === 'student'
                      ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/60'
                      : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white text-xs">
                    YOU
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-xs text-slate-900 truncate dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">Candidate</p>
                  </div>
                  {activeSpeaker === 'student' && (
                    <div className="absolute right-3 flex items-center space-x-0.5">
                      <span className="w-1 bg-emerald-600 rounded-full animate-wave-1" />
                      <span className="w-1 bg-emerald-600 rounded-full animate-wave-2" />
                      <span className="w-1 bg-emerald-600 rounded-full animate-wave-3" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Moderator Status Card */}
            <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
              <div className="flex items-center space-x-2">
                <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  AI Orchestrator & Moderator
                </span>
              </div>
              <p className="mt-1 text-xs text-indigo-700/80 dark:text-indigo-300">
                {isAiThinking
                  ? 'AI persona is formulating their contribution...'
                  : 'Moderating discussion flow. Add your point or let the personas debate.'}
              </p>
            </div>
          </div>

          {/* Right: Live Transcript & Voice/Text Composer */}
          <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {transcript.map((item, idx) => {
                const isStudent = item.speakerId === 'student' || (!item.isAi && item.speakerName === user?.name);
                const isMod = item.speakerId === 'ai-moderator';

                if (isMod) {
                  return (
                    <div
                      key={idx}
                      className="mx-auto max-w-lg rounded-xl border border-indigo-100 bg-indigo-50/80 p-3.5 text-center text-xs dark:border-indigo-900 dark:bg-indigo-950/40"
                    >
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">
                        AI Moderator:
                      </span>{' '}
                      <span className="text-slate-700 dark:text-slate-300">{item.text}</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`flex items-start space-x-3 ${
                      isStudent ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${
                        isStudent ? 'bg-emerald-600' : 'bg-indigo-600'
                      }`}
                    >
                      {isStudent ? 'YOU' : item.speakerName.charAt(0)}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 text-xs ${
                        isStudent
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <div
                        className={`mb-1 font-bold ${
                          isStudent ? 'text-emerald-100' : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {item.speakerName}
                      </div>
                      <p className="leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                );
              })}
              {isAiThinking && (
                <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:0.2s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:0.4s]" />
                  <span>AI persona is responding...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <div className="border-t border-slate-100 p-4 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  title={isMicOn ? 'Stop microphone' : 'Speak via microphone (Speech-to-text)'}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                    isMicOn
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {isMicOn ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <input
                  type="text"
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendTurn()}
                  placeholder={isMicOn ? 'Listening to your speech...' : 'Type your point or click mic to speak...'}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />

                <button
                  type="button"
                  onClick={handleSendTurn}
                  disabled={!studentInput.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-all hover:bg-indigo-700 disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EVALUATION REPORT VIEW
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Performance Assessment
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Placement GD Evaluation Report
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
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Overall Readiness Score</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Synthesized across 8 university placement assessment criteria
          </p>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
            {evaluation?.overallScore || 80}
          </span>
          <span className="text-sm font-semibold text-slate-400">/ 100</span>
        </div>
      </div>

      {/* Rubric Breakdown Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Dimensional Rubric Performance
          </h3>
          <RubricRow label="Clarity of Expression" val={evaluation?.clarityOfExpression || 82} />
          <RubricRow label="Topic Relevance" val={evaluation?.topicRelevance || 85} />
          <RubricRow label="Logical Structure" val={evaluation?.logicalStructure || 78} />
          <RubricRow label="Supporting Arguments & Evidence" val={evaluation?.supportingArguments || 75} />
          <RubricRow label="Active Listening & Synthesis" val={evaluation?.activeListening || 80} />
          <RubricRow label="Respectful Disagreement" val={evaluation?.respectfulDisagreement || 76} />
          <RubricRow label="Teamwork & Collaboration" val={evaluation?.teamworkAndCollaboration || 84} />
          <RubricRow label="Turn & Speaking Balance" val={evaluation?.participationBalance || 78} />
        </div>

        {/* Strengths & Actionable Tips */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-2 text-emerald-600">
              <CheckCircle2 size={18} />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Demonstrated Strengths</h3>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {(evaluation?.strengths || [
                'Maintained composure and confident delivery during turns.',
                'Framed contributions around the core objectives of the prompt.',
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
                Actionable Interview Coaching Tips
              </h3>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {(evaluation?.actionableTips || [
                'Use the PREP framework: Point, Reason, Example, Point.',
                'Acknowledge previous speakers explicitly to show collaborative leadership.',
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
};

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
