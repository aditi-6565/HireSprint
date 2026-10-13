export type UserRole = 'STUDENT' | 'ADMIN' | 'TEACHER' | 'TNP' | 'STUDENT_COORDINATOR';
export declare const USER_ROLES: {
    [K in UserRole]: UserRole;
};
export type SessionType = 'AI_PRACTICE' | 'LIVE_GD';
export type SessionState = 'CREATED' | 'READY' | 'ACTIVE' | 'PAUSED' | 'EVALUATING' | 'COMPLETED' | 'CANCELLED';
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
export declare const AI_PERSONAS: Record<string, AIPersonaConfig>;
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
export declare const SOCKET_EVENTS: {
    readonly MEETING_JOIN: "meeting:join";
    readonly MEETING_LEAVE: "meeting:leave";
    readonly MEETING_STATE: "meeting:state";
    readonly MEETING_PARTICIPANT_JOINED: "meeting:participant-joined";
    readonly MEETING_PARTICIPANT_LEFT: "meeting:participant-left";
    readonly WEBRTC_OFFER: "webrtc:offer";
    readonly WEBRTC_ANSWER: "webrtc:answer";
    readonly WEBRTC_ICE_CANDIDATE: "webrtc:ice-candidate";
    readonly MEETING_CHAT: "meeting:chat";
    readonly MEETING_HAND_RAISE: "meeting:hand-raise";
    readonly MEETING_TRANSCRIPT: "meeting:transcript";
    readonly MEETING_MODERATOR_EVENT: "meeting:moderator-event";
    readonly MEETING_ERROR: "meeting:error";
    readonly NOTIFICATION_RECEIVE: "notification:receive";
};
