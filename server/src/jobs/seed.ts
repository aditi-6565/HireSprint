import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  User,
  DepartmentClass,
  GDTopic,
  LearningResource,
  Assignment,
  PlatformSetting,
} from '../models/index.js';

export async function runSeed() {
  console.log('[Seed] Connecting to MongoDB...');
  await connectDB();

  console.log('[Seed] Seeding platform settings...');
  await PlatformSetting.findOneAndUpdate(
    { key: 'groq_model' },
    { key: 'groq_model', value: 'llama-3.3-70b-versatile', description: 'Default AI inference model' },
    { upsert: true }
  );

  console.log('[Seed] Seeding department classes...');
  const deptCSE = await DepartmentClass.findOneAndUpdate(
    { code: 'CSE-2026' },
    {
      name: 'Computer Science & Engineering 2026',
      code: 'CSE-2026',
      department: 'Computer Science',
      year: 4,
      academicYear: '2025-2026',
      isActive: true,
    },
    { upsert: true, new: true }
  );

  const deptIT = await DepartmentClass.findOneAndUpdate(
    { code: 'IT-2026' },
    {
      name: 'Information Technology 2026',
      code: 'IT-2026',
      department: 'Information Technology',
      year: 4,
      academicYear: '2025-2026',
      isActive: true,
    },
    { upsert: true, new: true }
  );

  console.log('[Seed] Seeding users across all 5 roles...');
  const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'HireSprint@123';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const usersData = [
    {
      name: 'Super Admin',
      email: 'admin@hiresprint.local',
      role: 'ADMIN' as const,
      departmentName: 'Administration',
    },
    {
      name: 'Prof. Ramesh Sharma',
      email: 'teacher@hiresprint.local',
      role: 'TEACHER' as const,
      departmentName: 'Computer Science & Engineering',
      departmentId: deptCSE._id,
    },
    {
      name: 'Vikram Singhania (TnP Officer)',
      email: 'tnp@hiresprint.local',
      role: 'TNP' as const,
      departmentName: 'Training & Placement Cell',
    },
    {
      name: 'Pooja Hegde (Coordinator)',
      email: 'coordinator@hiresprint.local',
      role: 'STUDENT_COORDINATOR' as const,
      departmentName: 'Computer Science & Engineering',
      departmentId: deptCSE._id,
    },
    {
      name: 'Aditi Patel (Student)',
      email: 'student@hiresprint.local',
      role: 'STUDENT' as const,
      departmentName: 'Computer Science & Engineering',
      departmentId: deptCSE._id,
    },
    {
      name: 'Rahul Verma (Student)',
      email: 'rahul@hiresprint.local',
      role: 'STUDENT' as const,
      departmentName: 'Computer Science & Engineering',
      departmentId: deptCSE._id,
    },
  ];

  const createdUsers: Record<string, any> = {};
  for (const u of usersData) {
    const user = await User.findOneAndUpdate(
      { email: u.email },
      {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        departmentName: u.departmentName,
        departmentId: u.departmentId,
        isActive: true,
      },
      { upsert: true, new: true }
    );
    createdUsers[u.email] = user;
    console.log(` -> Seeded user: ${u.email} [${u.role}]`);
  }

  console.log('[Seed] Seeding curated GD topics...');
  const topicsData = [
    {
      title: 'Impact of Generative AI on Entry-Level Engineering Careers',
      description: 'Will generative AI tools replace junior engineers, or will they elevate expectations for systems architecture, critical thinking, and rapid prototyping?',
      category: 'Technology & Placement',
      difficulty: 'Intermediate' as const,
      learningObjectives: [
        'Analyze productivity gains vs workforce contraction',
        'Debate the evolving skillset required for fresh campus graduates',
        'Synthesize ethical considerations regarding IP and code security',
      ],
      preparationGuide: 'Consider recent reports from Gartner, GitHub Copilot metrics, and university hiring trends over the last 18 months.',
      rules: [
        'Back up assertions with industry precedents.',
        'Address counter-arguments constructively.',
        'Maintain turn balance and avoid monopolizing the floor.',
      ],
      isPublished: true,
      createdBy: createdUsers['teacher@hiresprint.local']._id,
    },
    {
      title: 'Remote Work vs Return-to-Office: Productivity, Culture, and Innovation',
      description: 'Examine corporate mandates requiring employees to return to office vs modern distributed work models, focusing on retention, mentoring, and output.',
      category: 'Workplace & Culture',
      difficulty: 'Beginner' as const,
      learningObjectives: [
        'Evaluate impact on work-life harmony and mental health',
        'Examine communication overhead and asynchronous workflows',
        'Propose hybrid compromises for technology companies',
      ],
      preparationGuide: 'Review productivity surveys from tech hubs and employee retention stats.',
      rules: ['Limit individual statements to 45 seconds.', 'Encourage quiet participants.'],
      isPublished: true,
      createdBy: createdUsers['teacher@hiresprint.local']._id,
    },
    {
      title: 'Ethical Implications of AI Decision-Making in Campus Placements',
      description: 'Can algorithmic resume screening and automated video interview analysis eliminate human bias, or do they codify systemic exclusion?',
      category: 'Ethics & AI',
      difficulty: 'Advanced' as const,
      learningObjectives: [
        'Identify algorithmic bias and transparency issues in HR Tech',
        'Compare human recruiter biases against machine learning errors',
        'Formulate policy recommendations for fair campus recruitment',
      ],
      preparationGuide: 'Study recent EU AI Act regulations and hiring discrimination audit studies.',
      rules: ['Ground opinions in verifiable algorithmic case studies.', 'Do not interrupt during opening definitions.'],
      isPublished: true,
      createdBy: createdUsers['tnp@hiresprint.local']._id,
    },
    {
      title: 'Electric Vehicles in Developing Economies: Grid Infrastructure vs Market Adoption',
      description: 'Are subsidy programs sufficient to transition commercial fleets, or does grid instability and lack of charging infrastructure stall long-term viability?',
      category: 'Economy & Energy',
      difficulty: 'Intermediate' as const,
      learningObjectives: [
        'Examine lithium supply chains and domestic manufacturing',
        'Discuss power grid load management and clean energy mix',
        'Explore total cost of ownership for consumer segments',
      ],
      preparationGuide: 'Review Ministry of Power renewable targets and battery manufacturing investments.',
      rules: ['Use quantitative estimates where possible.', 'Synthesize key points at turn boundaries.'],
      isPublished: true,
      createdBy: createdUsers['teacher@hiresprint.local']._id,
    },
  ];

  const seededTopics = [];
  for (const t of topicsData) {
    const topic = await GDTopic.findOneAndUpdate(
      { title: t.title },
      t,
      { upsert: true, new: true }
    );
    seededTopics.push(topic);
    console.log(` -> Seeded topic: "${t.title}"`);
  }

  console.log('[Seed] Seeding learning resources...');
  const resourcesData = [
    {
      title: 'Mastering the 8-Dimension University GD Rubric',
      description: 'Comprehensive breakdown of how campus placement panels evaluate clarity, leadership, active listening, and evidence-based argumentation.',
      category: 'Placement Strategy',
      type: 'rubric' as const,
      content: `### 8 Core Placement GD Evaluation Criteria:
1. **Clarity of Expression**: Articulate vocabulary, steady cadence, crisp delivery.
2. **Relevance to Topic**: Staying focused on the central prompt without drifting off-tangent.
3. **Logical Structure**: Opening thesis, supporting premises, and concluding synthesis.
4. **Supporting Arguments & Evidence**: Citing statistics, industry examples, and case studies.
5. **Active Listening**: Referencing and validating previous speakers' points before replying.
6. **Respectful Disagreement**: Phrasing dissent diplomatically ("I understand X's view, however we must also weigh Y...").
7. **Teamwork & Collaboration**: Passing the floor to quieter participants and forging consensus.
8. **Participation Balance**: Consistent high-value contributions without aggressive monopolization.`,
      authorId: createdUsers['tnp@hiresprint.local']._id,
      authorName: 'Vikram Singhania (TnP Cell)',
      isPublished: true,
    },
    {
      title: 'How to Gracefully Intervene and Guide a Chaotic Group Discussion',
      description: 'Tactical guide for earning high leadership scores by summarizing competing factions and asking structured synthesizing questions.',
      category: 'Communication Techniques',
      type: 'guide' as const,
      content: `When a GD becomes heated or chaotic:
- Step in with a calming, synthesized summary: "Friends, we have two strong viewpoints here: Side A highlights innovation, while Side B highlights risk. Let us see how we can bridge both."
- Ask a calibrating question: "What concrete safeguards could we implement to make this feasible?"
- Bring in a quiet participant: "Karan has been observing this exchange closely — Karan, what is your view on this tradeoff?"`,
      authorId: createdUsers['teacher@hiresprint.local']._id,
      authorName: 'Prof. Ramesh Sharma',
      isPublished: true,
    },
  ];

  for (const r of resourcesData) {
    await LearningResource.findOneAndUpdate(
      { title: r.title },
      r,
      { upsert: true, new: true }
    );
    console.log(` -> Seeded resource: "${r.title}"`);
  }

  console.log('[Seed] Seeding sample assignment...');
  await Assignment.findOneAndUpdate(
    { title: 'Placement GD Practice Round 1: Generative AI in Software' },
    {
      title: 'Placement GD Practice Round 1: Generative AI in Software',
      instructions: 'Complete one 10-minute AI practice session with at least 3 AI personas on the topic of Generative AI in Engineering. Review your AI evaluation report and submit your self-reflection.',
      topicId: seededTopics[0]._id,
      assignedClasses: [deptCSE._id, deptIT._id],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdBy: createdUsers['teacher@hiresprint.local']._id,
      isPublished: true,
    },
    { upsert: true, new: true }
  );

  console.log('\n======================================================');
  console.log('✅ DATABASE SEED COMPLETE!');
  console.log('======================================================');
  console.log('Test Accounts (Password: ' + defaultPassword + '):');
  console.log(' • ADMIN:        admin@hiresprint.local');
  console.log(' • TEACHER:      teacher@hiresprint.local');
  console.log(' • TNP:          tnp@hiresprint.local');
  console.log(' • COORDINATOR:  coordinator@hiresprint.local');
  console.log(' • STUDENT:      student@hiresprint.local');
  console.log('======================================================\n');
}

// If run directly
if (process.argv[1]?.endsWith('seed.ts')) {
  runSeed()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seed Error]:', err);
      await disconnectDB();
      process.exit(1);
    });
}
