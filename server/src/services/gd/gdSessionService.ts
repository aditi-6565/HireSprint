import mongoose from 'mongoose';
import {
  GDSession,
  GDParticipant,
  TranscriptSegment,
  ModeratorEvent,
  Evaluation,
  GDTopic,
  User,
  AttendanceRecord,
} from '../../models/index.js';
import { AIService } from '../ai/groqService.js';
import { AI_PERSONAS, SessionState } from 'hiresprint-shared';

export class GDSessionService {
  /**
   * Create a new GD session (AI Practice or Live GD)
   */
  static async createSession(data: {
    title: string;
    topicId?: string;
    topicTitle?: string;
    sessionType: 'AI_PRACTICE' | 'LIVE_GD';
    creatorId: string;
    durationMinutes?: number;
    maxParticipants?: number;
    moderationMode?: 'TEXT' | 'SPOKEN';
    selectedPersonas?: string[];
  }) {
    let topicTitle = data.topicTitle || 'Group Discussion';

    if (data.topicId) {
      const topic = await GDTopic.findById(data.topicId);
      if (topic) {
        topicTitle = topic.title;
      }
    }

    const creator = await User.findById(data.creatorId);

    const defaultPersonas = ['confident_communicator', 'analytical_thinker', 'data_speaker', 'respectful_challenger'];

    const session = await GDSession.create({
      title: data.title || `${topicTitle} - Session`,
      topicId: data.topicId ? new mongoose.Types.ObjectId(data.topicId) : undefined,
      topicTitle,
      sessionType: data.sessionType,
      status: 'READY',
      creatorId: new mongoose.Types.ObjectId(data.creatorId),
      creatorName: creator?.name || 'Creator',
      durationMinutes: data.durationMinutes || 10,
      maxParticipants: data.maxParticipants || (data.sessionType === 'AI_PRACTICE' ? 5 : 8),
      moderationMode: data.moderationMode || 'TEXT',
      selectedPersonas: data.selectedPersonas && data.selectedPersonas.length > 0 ? data.selectedPersonas : defaultPersonas,
    });

    // Add creator as initial participant
    if (creator) {
      await GDParticipant.create({
        sessionId: session._id,
        userId: creator._id,
        userName: creator.name,
        userRole: creator.role,
        role: data.sessionType === 'LIVE_GD' && ['TEACHER', 'STUDENT_COORDINATOR', 'ADMIN'].includes(creator.role) ? 'host' : 'speaker',
      });
    }

    // If AI practice, insert opening moderator statement
    if (data.sessionType === 'AI_PRACTICE') {
      const introText = await AIService.generateModeratorTurn(session.topicTitle, 'intro', []);
      await TranscriptSegment.create({
        sessionId: session._id,
        speakerId: 'ai-moderator',
        speakerName: 'AI Moderator',
        isAi: true,
        personaId: 'moderator',
        text: introText,
        sequence: 1,
        source: 'ai_generated',
      });
      await ModeratorEvent.create({
        sessionId: session._id,
        eventType: 'intro',
        message: introText,
      });
    }

    return session;
  }

  /**
   * Start a session (changes status to ACTIVE)
   */
  static async startSession(sessionId: string, userId: string) {
    const session = await GDSession.findById(sessionId);
    if (!session) throw new Error('Session not found');

    session.status = 'ACTIVE';
    session.startedAt = new Date();
    await session.save();
    return session;
  }

  /**
   * Add a student transcript turn and optionally trigger next AI persona
   */
  static async addTranscriptTurn(
    sessionId: string,
    speakerId: string,
    speakerName: string,
    text: string,
    source: 'live_speech' | 'typed_input' = 'typed_input'
  ) {
    const session = await GDSession.findById(sessionId);
    if (!session) throw new Error('Session not found');

    const lastSegment = await TranscriptSegment.findOne({ sessionId: session._id }).sort({ sequence: -1 });
    const nextSequence = (lastSegment?.sequence || 0) + 1;

    const segment = await TranscriptSegment.create({
      sessionId: session._id,
      speakerId,
      speakerName,
      isAi: false,
      text: text.trim(),
      sequence: nextSequence,
      source,
    });

    return segment;
  }

  /**
   * Generate next AI persona turn in an AI practice session
   */
  static async generateNextAIPersonaTurn(sessionId: string, specificPersonaId?: string) {
    const session = await GDSession.findById(sessionId);
    if (!session || session.sessionType !== 'AI_PRACTICE') {
      throw new Error('Valid AI practice session required');
    }

    const segments = await TranscriptSegment.find({ sessionId: session._id }).sort({ sequence: 1 });
    const recent = segments.map(s => ({ speaker: s.speakerName, text: s.text }));

    // Find student participant name
    const student = await GDParticipant.findOne({ sessionId: session._id, role: 'speaker' });
    const studentName = student?.userName || 'Candidate';

    // Determine which persona speaks next
    const personas = session.selectedPersonas || ['confident_communicator', 'analytical_thinker'];
    let chosenPersonaId = specificPersonaId;

    if (!chosenPersonaId) {
      // Rotate among selected personas avoiding repeating the immediate last persona
      const lastAiSegment = [...segments].reverse().find(s => s.isAi && s.personaId !== 'moderator');
      const lastPersonaId = lastAiSegment?.personaId;
      const candidates = personas.filter(p => p !== lastPersonaId);
      chosenPersonaId = candidates[Math.floor(Math.random() * candidates.length)] || personas[0];
    }

    const personaConfig = AI_PERSONAS[chosenPersonaId] || AI_PERSONAS['confident_communicator'];

    const replyText = await AIService.generatePersonaTurn(
      chosenPersonaId,
      session.topicTitle,
      recent,
      studentName
    );

    const nextSeq = (segments[segments.length - 1]?.sequence || 0) + 1;

    const newSegment = await TranscriptSegment.create({
      sessionId: session._id,
      speakerId: `ai-${chosenPersonaId}`,
      speakerName: personaConfig.name,
      isAi: true,
      personaId: chosenPersonaId,
      text: replyText,
      sequence: nextSeq,
      source: 'ai_generated',
    });

    return {
      segment: newSegment,
      persona: personaConfig,
    };
  }

  /**
   * Conclude session and generate multi-dimensional evaluation
   */
  static async completeSession(sessionId: string) {
    const session = await GDSession.findById(sessionId);
    if (!session) throw new Error('Session not found');

    session.status = 'COMPLETED';
    session.endedAt = new Date();
    await session.save();

    // Fetch all transcript segments
    const segments = await TranscriptSegment.find({ sessionId: session._id }).sort({ sequence: 1 });
    const fullTranscript = segments.map(s => ({ speaker: s.speakerName, text: s.text }));

    // Find all human participants
    const participants = await GDParticipant.find({ sessionId: session._id });

    const evaluations = [];

    for (const p of participants) {
      const studentSegments = segments.filter(s => s.speakerId === p.userId.toString() || (!s.isAi && s.speakerName === p.userName));
      const studentTexts = studentSegments.map(s => s.text);

      const rubric = await AIService.generateEvaluation(
        session.topicTitle,
        p.userName,
        studentTexts,
        fullTranscript
      );

      const evaluation = await Evaluation.findOneAndUpdate(
        { sessionId: session._id, userId: p.userId },
        {
          sessionId: session._id,
          userId: p.userId,
          userName: p.userName,
          topicTitle: session.topicTitle,
          evaluatorSource: 'ai',
          rubric,
        },
        { upsert: true, new: true }
      );

      // Record attendance
      const joinTime = p.joinedAt || session.startedAt || new Date();
      const leaveTime = p.leftAt || session.endedAt || new Date();
      const durationSeconds = Math.round((leaveTime.getTime() - joinTime.getTime()) / 1000);

      await AttendanceRecord.findOneAndUpdate(
        { sessionId: session._id, userId: p.userId },
        {
          sessionId: session._id,
          userId: p.userId,
          userName: p.userName,
          userEmail: (await User.findById(p.userId))?.email || 'student@hiresprint.local',
          joinTime,
          leaveTime,
          durationSeconds,
          status: durationSeconds > 60 ? 'PRESENT' : 'PARTIAL',
        },
        { upsert: true }
      );

      evaluations.push(evaluation);
    }

    return { session, evaluations };
  }

  /**
   * Get session with details, participants, and transcript
   */
  static async getSessionDetails(sessionId: string) {
    const session = await GDSession.findById(sessionId);
    if (!session) throw new Error('Session not found');

    const participants = await GDParticipant.find({ sessionId: session._id });
    const transcript = await TranscriptSegment.find({ sessionId: session._id }).sort({ sequence: 1 });
    const moderatorEvents = await ModeratorEvent.find({ sessionId: session._id }).sort({ timestamp: 1 });
    const evaluation = await Evaluation.findOne({ sessionId: session._id });

    return {
      session,
      participants,
      transcript,
      moderatorEvents,
      evaluation,
    };
  }
}
