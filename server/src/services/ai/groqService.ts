import { AI_PERSONAS, AIPersonaConfig, EvaluationRubric } from 'hiresprint-shared';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIService {
  private static apiKey = process.env.GROQ_API_KEY || '';
  private static model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  static isConfigured(): boolean {
    return Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '');
  }

  /**
   * Raw completion caller to Groq API
   */
  static async getCompletion(messages: ChatMessage[], temperature = 0.7, maxTokens = 800): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      throw new Error('GROQ_API_KEY_NOT_CONFIGURED');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * Generates a coherent conversational contribution for a specific AI Persona
   */
  static async generatePersonaTurn(
    personaId: string,
    topicTitle: string,
    recentTranscript: Array<{ speaker: string; text: string }>,
    studentName: string
  ): Promise<string> {
    const persona: AIPersonaConfig = AI_PERSONAS[personaId] || AI_PERSONAS['confident_communicator'];

    const conversationContext = recentTranscript
      .slice(-6)
      .map((t) => `${t.speaker}: "${t.text}"`)
      .join('\n');

    const systemPrompt = `You are ${persona.name}, roleplaying as a candidate in a competitive campus recruitment Group Discussion.
Your designated conversational persona is: ${persona.role}.
Persona Style: ${persona.style}
Persona Instruction: ${persona.systemPromptAddition}

DISCUSSION TOPIC: "${topicTitle}"
STUDENT PARTICIPANT IN ROOM: "${studentName}"

RULES:
1. Speak in first person, concise, natural, and conversational (3 to 5 sentences maximum).
2. Directly reference or build upon what previous candidates said, especially the student "${studentName}" if they recently spoke.
3. Keep your tone professional, constructive, and suitable for a campus placement GD.
4. Do NOT output stage directions, quotes around your entire response, or your name as a prefix. Just output your spoken words.`;

    const userPrompt = `Here is the recent discussion transcript:
${conversationContext || '(The discussion has just started)'}

Now, it is your turn to speak. Contribute your point according to your persona:`;

    try {
      if (this.isConfigured()) {
        const reply = await this.getCompletion(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          0.7,
          350
        );
        if (reply.trim()) return reply.trim();
      }
    } catch (err: any) {
      console.warn(`[AIService] Groq API call failed (${err.message}). Using intelligent heuristic persona generation.`);
    }

    // Heuristic Fallback
    return this.generateHeuristicPersonaTurn(persona, topicTitle, recentTranscript, studentName);
  }

  /**
   * Generates AI Moderator intervention or wrap-up
   */
  static async generateModeratorTurn(
    topicTitle: string,
    action: 'intro' | 'nudge' | 'question' | 'warning' | 'summary',
    recentTranscript: Array<{ speaker: string; text: string }>,
    targetSpeaker?: string
  ): Promise<string> {
    const systemPrompt = `You are the university AI Moderator for a formal placement Group Discussion on the topic: "${topicTitle}".
Your responsibility is to maintain professional decorum, facilitate balanced participation, encourage evidence-based points, and keep the session structured.
Output ONLY your spoken moderator statement (2-3 sentences max). Be encouraging, firm, and articulate.`;

    let userPrompt = '';
    if (action === 'intro') {
      userPrompt = `Please open the discussion on "${topicTitle}". Welcome the candidates, state that each candidate should present structured points with evidence, and invite the first speaker to open.`;
    } else if (action === 'question') {
      const summary = recentTranscript.slice(-4).map(t => `${t.speaker}: ${t.text}`).join('\n');
      userPrompt = `Given recent discussion:\n${summary}\nPose a deep, critical follow-up question to steer the debate to the next level.`;
    } else if (action === 'warning') {
      userPrompt = `Give a 2-minute time warning, reminding candidates to begin synthesizing their core takeaways and working toward consensus.`;
    } else if (action === 'summary') {
      const summary = recentTranscript.slice(-8).map(t => `${t.speaker}: ${t.text}`).join('\n');
      userPrompt = `Based on the discussion transcript:\n${summary}\nProvide a concise closing synthesis of the competing arguments and officially conclude the discussion.`;
    } else {
      userPrompt = `Remind the group to maintain balanced speaking time and encourage ${targetSpeaker || 'quieter participants'} to share their insights.`;
    }

    try {
      if (this.isConfigured()) {
        const reply = await this.getCompletion(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          0.6,
          250
        );
        if (reply.trim()) return reply.trim();
      }
    } catch (err: any) {
      console.warn(`[AIService] Moderator Groq API failed (${err.message}). Using heuristic moderator.`);
    }

    // Fallback Heuristic Moderator
    if (action === 'intro') {
      return `Welcome, everyone, to today's placement group discussion on "${topicTitle}". The objective is to evaluate logical reasoning, active listening, and evidence-based collaboration. Please maintain respectful turn-taking. Who would like to open the discussion?`;
    } else if (action === 'warning') {
      return `Candidates, we have approximately two minutes remaining in this session. Let us now transition from presenting new arguments to synthesizing key tradeoffs and working toward a unified conclusion.`;
    } else if (action === 'summary') {
      return `Thank you, candidates. That concludes our group discussion. We explored multiple dimensions of "${topicTitle}", from structural opportunities to operational risks. The session is now closed for evaluation.`;
    } else if (action === 'question') {
      return `We have heard compelling perspectives on the direct impact. However, how should organizations balance rapid short-term implementation against long-term societal and ethical safeguards? Let us examine that tradeoff.`;
    } else {
      return `Let us ensure we hear diverse viewpoints across the entire panel. ${targetSpeaker ? `${targetSpeaker}, what are your thoughts on this?` : 'I encourage participants who have not yet spoken to present their perspective.'}`;
    }
  }

  /**
   * Generates a comprehensive multi-dimensional Evaluation Rubric for a student
   */
  static async generateEvaluation(
    topicTitle: string,
    studentName: string,
    studentTranscript: string[],
    fullTranscript: Array<{ speaker: string; text: string }>
  ): Promise<EvaluationRubric> {
    const studentTextCombined = studentTranscript.join(' ');
    const wordCount = studentTextCombined.trim().split(/\s+/).filter(Boolean).length;
    const turnsCount = studentTranscript.length;

    const systemPrompt = `You are a Senior Placement Evaluation Specialist assessing a candidate in a university recruitment Group Discussion.
TOPIC: "${topicTitle}"
CANDIDATE: "${studentName}"
CANDIDATE CONTRIBUTIONS:
${studentTranscript.map((t, i) => `Turn ${i + 1}: "${t}"`).join('\n') || '(Candidate made no contributions)'}

FULL TRANSCRIPT EXCERPT:
${fullTranscript.slice(-10).map(t => `${t.speaker}: "${t.text}"`).join('\n')}

Evaluate the candidate objectively across 8 dimensions on a 0-100 scale:
1. clarityOfExpression
2. topicRelevance
3. logicalStructure
4. supportingArguments
5. activeListening
6. respectfulDisagreement
7. teamworkAndCollaboration
8. participationBalance

Return valid JSON ONLY in this format:
{
  "clarityOfExpression": number,
  "topicRelevance": number,
  "logicalStructure": number,
  "supportingArguments": number,
  "activeListening": number,
  "respectfulDisagreement": number,
  "teamworkAndCollaboration": number,
  "participationBalance": number,
  "overallScore": number,
  "strengths": ["string", "string"],
  "areasOfImprovement": ["string", "string"],
  "actionableTips": ["string", "string"],
  "evidenceExamples": [
    { "quote": "exact or near quote from candidate", "context": "context", "feedback": "constructive analysis" }
  ]
}`;

    try {
      if (this.isConfigured() && studentTranscript.length > 0) {
        const rawJson = await this.getCompletion(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Generate the structured JSON evaluation rubric now.' },
          ],
          0.3,
          900
        );

        const cleanJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.overallScore && parsed.clarityOfExpression) {
          return parsed as EvaluationRubric;
        }
      }
    } catch (err: any) {
      console.warn(`[AIService] Evaluation API call failed (${err.message}). Using calibrated heuristic rubric.`);
    }

    // Calibrated Heuristic Rubric
    const baseScore = studentTranscript.length === 0 
      ? 40 
      : Math.min(94, Math.max(55, 62 + Math.min(22, Math.floor(wordCount / 8)) + Math.min(10, turnsCount * 3)));

    const clarity = Math.min(95, baseScore + (wordCount > 40 ? 4 : -5));
    const relevance = Math.min(96, baseScore + 3);
    const structure = Math.min(92, baseScore - 2);
    const supporting = Math.min(90, baseScore + (wordCount > 60 ? 5 : -4));
    const listening = Math.min(94, baseScore + (turnsCount >= 2 ? 6 : -3));
    const disagreement = Math.max(60, baseScore - 1);
    const teamwork = Math.min(95, baseScore + 4);
    const participation = Math.min(96, Math.max(50, turnsCount * 25));

    const overallScore = Math.round(
      (clarity + relevance + structure + supporting + listening + disagreement + teamwork + participation) / 8
    );

    const firstQuote = studentTranscript[0] || 'Participated in group discussion session.';

    return {
      clarityOfExpression: clarity,
      topicRelevance: relevance,
      logicalStructure: structure,
      supportingArguments: supporting,
      activeListening: listening,
      respectfulDisagreement: disagreement,
      teamworkAndCollaboration: teamwork,
      participationBalance: participation,
      overallScore,
      strengths: [
        'Maintained composure and demonstrated professional tone throughout speaking turns.',
        'Connected arguments directly to the central premise of the discussion topic.',
        turnsCount > 1 ? 'Actively engaged multiple times during the session.' : 'Articulated thoughts clearly during your turn.'
      ],
      areasOfImprovement: [
        'Incorporate more quantitative data, case studies, or industry benchmarks to substantiate claims.',
        'Explicitly reference points made by preceding speakers before introducing new arguments to exhibit active listening.',
        'Take initiative in synthesizing divergent perspectives toward the final third of the discussion.'
      ],
      actionableTips: [
        'Structure your arguments using the PREP framework (Point, Reason, Example, Point).',
        'When disagreeing, use diplomatic bridge phrases such as: "While that perspective is valid in context X, we must also consider Y...".',
        'Spend the first 10 seconds of your turn validating the previous speaker to boost your collaboration and leadership metrics.'
      ],
      evidenceExamples: [
        {
          quote: firstQuote.length > 80 ? firstQuote.substring(0, 80) + '...' : firstQuote,
          context: `Opening contribution on "${topicTitle}"`,
          feedback: 'Clear articulation; could be strengthened further with a concrete empirical example or case study.'
        }
      ]
    };
  }

  private static generateHeuristicPersonaTurn(
    persona: AIPersonaConfig,
    topicTitle: string,
    recentTranscript: Array<{ speaker: string; text: string }>,
    studentName: string
  ): string {
    const last = recentTranscript[recentTranscript.length - 1];
    const refersToLast = last ? `Building upon the point made by ${last.speaker}, ` : '';

    switch (persona.id) {
      case 'confident_communicator':
        return `${refersToLast}we need to look at "${topicTitle}" through both immediate implementation and long-term societal resilience. A balanced framework allows us to harness technological progress without compromising critical human oversight.`;
      case 'analytical_thinker':
        return `${refersToLast}if we deconstruct the core mechanisms of this issue, the underlying bottleneck is not just technological adoption, but regulatory and operational readiness. We must prioritize root-cause analysis over reactionary policies.`;
      case 'data_speaker':
        return `${refersToLast}recent industry benchmarking indicates that organizations investing proactively in adaptive frameworks see a 35% higher retention and productivity rate. Empirical evidence clearly supports a gradual, measured transition.`;
      case 'respectful_challenger':
        return `I appreciate that argument, but we must also acknowledge the unintended friction. What happens when infrastructure or accessibility constraints prevent equal participation across all demographic segments?`;
      case 'contrarian_debater':
        return `I'd like to offer a counter-perspective here. Perhaps conventional wisdom is too cautious. In high-growth sectors, disruptive agility often creates far more value than waiting for perfect consensus.`;
      case 'quiet_participant':
      default:
        return `${refersToLast}I believe the most practical first step is ensuring ethical guidelines and cross-functional training are established early on.`;
    }
  }
}
