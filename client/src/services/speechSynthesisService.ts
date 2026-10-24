/**
 * High-quality Speech Synthesis Engine for HireSprint AI Personas & Moderator
 * Uses HTML5 Web Speech Synthesis API with distinct voice personalities per persona
 */

export interface PersonaVoiceConfig {
  pitch: number;
  rate: number;
  gender: 'male' | 'female' | 'neutral';
  preferredVoices?: string[];
}

const PERSONA_VOICE_CONFIGS: Record<string, PersonaVoiceConfig> = {
  // Aarav Mehta: Confident Communicator (Energetic, clear, confident male)
  confident_communicator: {
    pitch: 1.0,
    rate: 1.05,
    gender: 'male',
    preferredVoices: ['Google UK English Male', 'Microsoft George', 'Ravi', 'David', 'English United Kingdom'],
  },
  // Dr. Priya Sen: Analytical Thinker (Articulate, structured, thoughtful female)
  analytical_thinker: {
    pitch: 1.1,
    rate: 0.98,
    gender: 'female',
    preferredVoices: ['Google UK English Female', 'Microsoft Hazel', 'Zira', 'Heera', 'English India'],
  },
  // Karan Sharma: Quiet Participant (Gentle, softer, steady male)
  quiet_participant: {
    pitch: 0.95,
    rate: 0.94,
    gender: 'male',
    preferredVoices: ['Microsoft Mark', 'Google US English', 'Guy', 'David'],
  },
  // Rohan Gupta: Data-Oriented Speaker (Crisp, fast-paced, empirical male)
  data_speaker: {
    pitch: 1.05,
    rate: 1.1,
    gender: 'male',
    preferredVoices: ['Google US English', 'Microsoft David', 'Ravi', 'English'],
  },
  // Ananya Verma: Respectful Challenger (Bright, polite dissenting female)
  respectful_challenger: {
    pitch: 1.2,
    rate: 1.02,
    gender: 'female',
    preferredVoices: ['Google US English Female', 'Microsoft Zira', 'Samantha', 'Victoria'],
  },
  // Vikram Joshi: Contrarian Debater (Deep, assertive, dramatic male)
  contrarian_debater: {
    pitch: 0.88,
    rate: 1.06,
    gender: 'male',
    preferredVoices: ['Microsoft George', 'Daniel', 'Alex', 'Fred'],
  },
  // AI Moderator: Authoritative, balanced, measured
  moderator: {
    pitch: 1.0,
    rate: 0.95,
    gender: 'neutral',
    preferredVoices: ['Google UK English Male', 'Microsoft Hazel', 'Alex', 'Daniel'],
  },
};

class SpeechService {
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
      if (this.voices.length > 0) {
        this.voicesLoaded = true;
      }
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Speak a dialogue statement for a specific AI Persona or Moderator
   */
  public speak(
    personaId: string,
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (this.isMuted || !text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onStart?.();
        setTimeout(() => {
          onEnd?.();
          resolve();
        }, 1200);
        return;
      }

      // Cancel any ongoing speech
      this.stop();

      const config = PERSONA_VOICE_CONFIGS[personaId] || PERSONA_VOICE_CONFIGS['confident_communicator'];
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      utterance.pitch = config.pitch;
      utterance.rate = config.rate;
      utterance.volume = 1.0;

      // Select optimal voice
      if (this.voices.length > 0) {
        let chosenVoice: SpeechSynthesisVoice | undefined;

        // Try preferred voices first
        if (config.preferredVoices) {
          for (const preferred of config.preferredVoices) {
            chosenVoice = this.voices.find(
              (v) =>
                v.name.toLowerCase().includes(preferred.toLowerCase()) ||
                v.lang.toLowerCase().includes(preferred.toLowerCase())
            );
            if (chosenVoice) break;
          }
        }

        // Fallback based on gender and English
        if (!chosenVoice) {
          const englishVoices = this.voices.filter((v) => v.lang.startsWith('en'));
          if (englishVoices.length > 0) {
            if (config.gender === 'female') {
              chosenVoice =
                englishVoices.find((v) =>
                  v.name.toLowerCase().includes('female') ||
                  v.name.toLowerCase().includes('zira') ||
                  v.name.toLowerCase().includes('samantha') ||
                  v.name.toLowerCase().includes('hazel')
                ) || englishVoices[1] || englishVoices[0];
            } else {
              chosenVoice =
                englishVoices.find((v) =>
                  v.name.toLowerCase().includes('male') ||
                  v.name.toLowerCase().includes('david') ||
                  v.name.toLowerCase().includes('george') ||
                  v.name.toLowerCase().includes('mark')
                ) || englishVoices[0];
            }
          } else {
            chosenVoice = this.voices[0];
          }
        }

        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }
      }

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('[SpeechSynthesis] Utterance error:', e);
        this.currentUtterance = null;
        onEnd?.();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }
}

export const speechService = new SpeechService();
