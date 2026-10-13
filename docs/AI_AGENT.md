# HireSprint AI Agent Architecture

## Overview
HireSprint features an extensible, provider-independent AI subsystem designed to power realistic Group Discussion practice and real-time live moderation.

## Primary AI Provider
- **Groq API**: High-speed inference using state-of-the-art open models (e.g. `llama-3.3-70b-versatile`).
- **Resilient Fallback Mode**: When `GROQ_API_KEY` is omitted or unconfigured, the system automatically falls back to an intelligent heuristic simulation engine that generates coherent conversational turns and rubrics, guaranteeing that the application is always runnable and testable.

## Key Capabilities

### 1. Autonomous AI Personas
Six distinct conversational personas interact dynamically based on the discussion topic and previous turns:
- **Aarav Mehta (Confident Communicator)**: Introduces structured arguments, seeks consensus, and drives discussion momentum.
- **Dr. Priya Sen (Analytical Thinker)**: Dissects points into root causes, structural tradeoffs, and systemic impacts.
- **Karan Sharma (Quiet Participant)**: Listens carefully, speaks concisely, and adds high-value observations.
- **Rohan Gupta (Data-Oriented Speaker)**: Grounds discourse in empirical statistics, economic metrics, and industry case studies.
- **Ananya Verma (Respectful Challenger)**: Diplomatically probes blind spots, risks, and unintended consequences.
- **Vikram Joshi (Contrarian Debater)**: Challenges conventional assumptions from disruptive, provocative angles.

### 2. Autonomous AI Moderator
Operates in both AI Practice and Live GD sessions:
- **Stage 1: Opening & Rules**: Explains the GD topic, time allocation, and collaboration expectations.
- **Stage 2: Active Monitoring**: Observes transcript pacing, intervenes if dominant speakers monopolize the discussion, encourages quiet participants, and nudges off-topic threads.
- **Stage 3: Deepening Discourse**: Injects thought-provoking follow-up prompts when momentum slows.
- **Stage 4: Wrap-Up & Evaluation**: Synthesizes the core viewpoints and triggers multi-dimensional evaluation.

### 3. Multi-Dimensional Rubric Evaluation
Evaluates 8 structured dimensions (scored 0–100):
1. Clarity of Expression
2. Relevance to Topic
3. Logical Structure
4. Supporting Arguments & Evidence
5. Active Listening & Synthesis
6. Respectful Disagreement
7. Teamwork & Collaboration
8. Participation Balance

Every evaluation includes concrete quoted excerpts from the participant's actual transcript, specific strengths, areas for improvement, and actionable tips for placement interviews.
