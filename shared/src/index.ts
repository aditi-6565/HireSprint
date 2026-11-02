export type UserRole = 'STUDENT' | 'ADMIN' | 'TEACHER' | 'TNP' | 'STUDENT_COORDINATOR';

export const USER_ROLES: { [K in UserRole]: UserRole } = {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  TNP: 'TNP',
  STUDENT_COORDINATOR: 'STUDENT_COORDINATOR',
};

export type SessionType = 'AI_PRACTICE' | 'LIVE_GD';

export type SessionState = 
  | 'CREATED'
  | 'READY'
  | 'ACTIVE'
  | 'PAUSED'
  | 'EVALUATING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface AIPersonaConfig {
  id: string;
  name: string;
  role: string;
  style: string;
  avatar: string;
  initials: string;
  accent: string;
  speakingTendency: 'frequent' | 'moderate' | 'selective' | 'rebuttal';
  systemPromptAddition: string;
}

export const AI_PERSONAS: Record<string, AIPersonaConfig> = {
  confident_communicator: {
    id: 'confident_communicator',
    name: 'Aarav Mehta',
    role: 'Confident Communicator',
    style: 'Articulate, forward-looking, initiates strong structure and builds consensus.',
    avatar: 'A',
    initials: 'AM',
    accent: 'blue',
    speakingTendency: 'frequent',
    systemPromptAddition: 'Speak with clarity and conviction. Frame ideas with clear introductory points, synthesize common ground, and invite others to build on your thoughts.'
  },
  analytical_thinker: {
    id: 'analytical_thinker',
    name: 'Dr. Priya Sen',
    role: 'Analytical Thinker',
    style: 'Logical, breaks topics into structured components, evaluates pros and cons.',
    avatar: 'P',
    initials: 'PS',
    accent: 'purple',
    speakingTendency: 'moderate',
    systemPromptAddition: 'Break down arguments into root causes and practical implications. Critique assumptions diplomatically and prioritize logical structure.'
  },
  quiet_participant: {
    id: 'quiet_participant',
    name: 'Karan Sharma',
    role: 'Quiet Participant',
    style: 'Observant, speaks only when prompted or after long turns, offers concise value.',
    avatar: 'K',
    initials: 'KS',
    accent: 'gray',
    speakingTendency: 'selective',
    systemPromptAddition: 'Keep your statements concise, humble, and to the point. Validate points raised by others before adding one sharp, focused observation.'
  },
  data_speaker: {
    id: 'data_speaker',
    name: 'Rohan Gupta',
    role: 'Data-Oriented Speaker',
    style: 'Fact-focused, cites metrics, case studies, economic and technological stats.',
    avatar: 'R',
    initials: 'RG',
    accent: 'emerald',
    speakingTendency: 'moderate',
    systemPromptAddition: 'Ground statements with realistic empirical examples, statistics, percentages, and industry precedents. Avoid vague generalizations.'
  },
  respectful_challenger: {
    id: 'respectful_challenger',
    name: 'Ananya Verma',
    role: 'Respectful Challenger',
    style: 'Polite dissent, highlights unintended consequences, prompts counter-arguments.',
    avatar: 'A',
    initials: 'AV',
    accent: 'amber',
    speakingTendency: 'rebuttal',
    systemPromptAddition: 'Courteously challenge popular consensus. Point out blind spots, implementation difficulties, and edge cases while acknowledging positive intents.'
  },
  contrarian_debater: {
    id: 'contrarian_debater',
    name: 'Vikram Joshi',
    role: 'Contrarian Debater',
    style: 'Provocative thinker, questions conventional wisdom, introduces unorthodox angles.',
    avatar: 'V',
    initials: 'VJ',
    accent: 'rose',
    speakingTendency: 'moderate',
    systemPromptAddition: 'Take the less conventional side of the debate. Challenge status quo assumptions, urging the team to look at the issue from a disruptive angle.'
  }
};

export interface EvaluationRubric {
  clarityOfExpression: number;
  topicRelevance: number;
  logicalStructure: number;
  supportingArguments: number;
  activeListening: number;
  respectfulDisagreement: number;
  teamworkAndCollaboration: number;
  participationBalance: number;
  overallScore: number;
  strengths: string[];
  areasOfImprovement: string[];
  actionableTips: string[];
  evidenceExamples: Array<{
    quote: string;
    context: string;
    feedback: string;
  }>;
}

export const SOCKET_EVENTS = {
  MEETING_JOIN: 'meeting:join',
  MEETING_LEAVE: 'meeting:leave',
  MEETING_STATE: 'meeting:state',
  MEETING_PARTICIPANT_JOINED: 'meeting:participant-joined',
  MEETING_PARTICIPANT_LEFT: 'meeting:participant-left',
  WEBRTC_OFFER: 'webrtc:offer',
  WEBRTC_ANSWER: 'webrtc:answer',
  WEBRTC_ICE_CANDIDATE: 'webrtc:ice-candidate',
  MEETING_CHAT: 'meeting:chat',
  MEETING_HAND_RAISE: 'meeting:hand-raise',
  MEETING_MODERATOR_EVENT: 'meeting:moderator-event',
  MEETING_ERROR: 'meeting:error',
  NOTIFICATION_RECEIVE: 'notification:receive'
} as const;
