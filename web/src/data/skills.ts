// The 9 Skills of Fulfillment — Life 2.0's core framework.
//
// Names, definitions and core questions are VERBATIM from Laura's alignment
// brief and should not be reworded without her sign-off.
//
// The four assessment statements per skill, and the lower/stronger/reflection/
// experiment copy, are DRAFTS written from the brief's "Assess:" bullet lists.
// The brief supplied one example item per skill (marked below) and explicitly
// noted the rest were "starting directions, not final validated assessment
// questions" — so these are pending Laura's review.
//
// Question standard, per the brief: measure the learnable skill, not the
// person's circumstances. "I have close friends" measures circumstance;
// "I intentionally create time for meaningful connection" measures capacity.

export type SkillGroupId = 'experience' | 'direct' | 'build';

export interface SkillGroup {
  id: SkillGroupId;
  title: string;
  description: string;
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'experience',
    title: 'How you experience life',
    description: 'These skills affect your capacity to physically and emotionally experience the life you already have.',
  },
  {
    id: 'direct',
    title: 'How you direct life',
    description: 'These skills affect where your life is going and how deliberately you are shaping it.',
  },
  {
    id: 'build',
    title: 'How you build life with and beyond yourself',
    description: 'These affect relationships, resources and your relationship to the world beyond your own internal experience.',
  },
];

export interface Skill {
  id: string;
  order: number;
  name: string;
  group: SkillGroupId;
  definition: string;
  coreQuestion: string;
  /** Only Meaning carries these; the brief lists the routes meaning can come through. */
  paths?: string[];
  /** Four statements, scored 1-10. First item in each is the brief's own example. */
  questions: string[];
  lowerFeelsLike: string;
  strongerCreates: string;
  reflectionQuestions: string[];
  experiment: string;
}

export const skills: Skill[] = [
  {
    id: 'connection',
    order: 1,
    name: 'Connection',
    group: 'build',
    definition: 'The skill of creating and maintaining relationships in which you feel known, loved, supported and connected.',
    coreQuestion: 'How well am I creating and maintaining meaningful connection?',
    questions: [
      'I make meaningful connection with the people who matter to me a consistent priority.',
      "I let people I trust see what is actually going on with me, not just the version that's doing fine.",
      'When something goes wrong between me and someone I care about, I move toward repairing it.',
      'I ask for support when I need it, instead of handling everything on my own.',
    ],
    lowerFeelsLike:
      'Plenty of people around you, and still a sense that nobody quite knows the current version of you. Relationships you value running on maintenance mode. A habit of being the one who helps, and rarely the one who asks.',
    strongerCreates:
      "People in your life who know the actual state of things and stay anyway. Support you don't have to earn or engineer. The particular relief of being fully known by at least a few people.",
    reflectionQuestions: [
      'Who knows the actual current version of your life, not the version from three years ago?',
      'When did you last let someone help you with something that mattered?',
      "Is there a relationship you value that's been running on autopilot?",
    ],
    experiment:
      "Pick one person this week and tell them one true thing you'd normally keep to yourself. Not a crisis. Just something real.",
  },
  {
    id: 'vitality',
    order: 2,
    name: 'Vitality',
    group: 'experience',
    definition: 'The skill of caring for your physical and mental capacity so you are available to experience your life.',
    coreQuestion: 'Do I have the energy and capacity to participate fully in my life?',
    questions: [
      'My current habits generally give me the energy I need to participate fully in my life.',
      'I protect my sleep and recovery even when things are busy.',
      'I move my body regularly in ways that support how I want to feel.',
      'The pace I am living at is one I could sustain for another year without running myself down.',
    ],
    lowerFeelsLike:
      'Getting through the day on momentum. Being physically present for people while having very little left to give them. Treating rest as the thing that happens after everything else, which means it mostly does not happen.',
    strongerCreates:
      "Energy that is actually available for the parts of life you care about. A body that supports what you are trying to do instead of limiting it. Capacity in reserve rather than permanently spent.",
    reflectionQuestions: [
      'What time of day do you feel most like yourself, and what are you usually doing with that time?',
      'What is the first thing you drop when you get busy?',
      'If your energy stayed exactly where it is for the next five years, what would that cost you?',
    ],
    experiment:
      'Choose the one recovery habit you have most let slide, and do it three times this week. Same time each day if you can.',
  },
  {
    id: 'regulation',
    order: 3,
    name: 'Regulation',
    group: 'experience',
    definition: 'The skill of experiencing difficult thoughts and emotions without allowing them to run your life.',
    coreQuestion: 'How skillfully can I experience my emotions without becoming controlled by them?',
    questions: [
      'When strong emotions arise, I can usually experience them without immediately acting from them.',
      'I can name what I am feeling while I am feeling it.',
      'After something upsets me, I come back to steady within a reasonable amount of time.',
      'I can sit with discomfort long enough to choose my response.',
    ],
    lowerFeelsLike:
      'Reacting first and understanding later. Long tails after hard conversations. The sense that a difficult mood gets to decide how the rest of the day goes.',
    strongerCreates:
      'A gap between what you feel and what you do. Shorter recoveries. Responding in ways that, most of the time, make you proud.',
    reflectionQuestions: [
      'What tends to hijack you fastest?',
      'How long does it usually take you to come back to yourself after something hard?',
      'What would change in your closest relationship if your recovery time were half as long?',
    ],
    experiment:
      'Next time you feel the reaction rising, name the feeling silently and count to ten before you respond. Once a day is enough to start.',
  },
  {
    id: 'agency',
    order: 4,
    name: 'Agency',
    group: 'direct',
    definition: 'The skill of deliberately choosing how you live rather than unconsciously living by obligation, expectation or default.',
    coreQuestion: 'How much of my life feels deliberately chosen?',
    questions: [
      "The way I currently spend my time reflects choices I have consciously made rather than obligations I have simply accumulated.",
      'I can say no to things that do not fit, even when saying yes would be easier.',
      'I can tell the difference between what I actually want and what I think I am supposed to want.',
      "When something in my life isn't working, I believe I can change it.",
    ],
    lowerFeelsLike:
      'A calendar that fills itself. Saying yes and resenting it later. A life that looks like a series of reasonable decisions nobody quite remembers making.',
    strongerCreates:
      'A life that feels authored rather than inherited. Boundaries that hold without a fight. The confidence that if something stops working, you can change it.',
    reflectionQuestions: [
      "What is on your calendar this week that you didn't actually choose?",
      'Where are you saying yes out of habit?',
      'If nobody had expectations of you, what would you stop doing?',
    ],
    experiment:
      'Find one recurring commitment you would decline if it were offered fresh today, and decline it.',
  },
  {
    id: 'meaning',
    order: 5,
    name: 'Meaning',
    group: 'direct',
    definition: 'The skill of connecting your life and effort to something that feels significant and worth pursuing.',
    coreQuestion: 'Does my life feel connected to something that genuinely matters to me?',
    paths: ['Purpose', 'Family', 'Spirituality', 'Faith', 'Service', 'Work', 'Creativity', 'Nature', 'Legacy', 'Community'],
    questions: [
      'I understand what makes the effort I put into my life feel worthwhile.',
      'My life feels connected to something larger than my own day-to-day concerns.',
      'I could explain why I am doing what I am doing, and believe the answer.',
      "The direction my life is heading is one I'd choose.",
    ],
    lowerFeelsLike:
      "Working hard without being able to say what it is all in service of. Hitting goals that don't land the way you expected. A quiet “is this it” that shows up in the gaps.",
    strongerCreates:
      "Effort that feels like it is going somewhere. A reason that holds up on hard days. The sense that your life is about something.",
    reflectionQuestions: [
      'If your life were a book, would you be compelled by where the story is heading?',
      "What is the thing you'd still care about if nobody were watching?",
      'Where does your effort currently go, and is that where it belongs?',
    ],
    experiment:
      'Write one sentence describing what you want this year to be in service of. Keep it somewhere you will actually see it.',
  },
  {
    id: 'mastery',
    order: 6,
    name: 'Mastery',
    group: 'direct',
    definition: 'The skill of continuing to learn, stretch, build competence and experience yourself becoming more capable.',
    coreQuestion: 'Where am I learning, stretching and becoming more capable?',
    questions: [
      'I am currently developing abilities that make me feel more capable and engaged.',
      'I regularly do things that stretch me slightly beyond what I am already good at.',
      'I am curious about things right now, not just busy with things.',
      'I can point to something I am measurably better at than I was a year ago.',
    ],
    lowerFeelsLike:
      'Being extremely competent at things you mastered years ago. Busy without growing. The particular flatness of doing work you could do in your sleep.',
    strongerCreates:
      'The specific aliveness of being a beginner again. Confidence built on current evidence rather than old wins. Momentum.',
    reflectionQuestions: [
      'When did you last do something you were not already good at?',
      'What are you curious about that you have been treating as a someday?',
      'What would you attempt if being bad at it first were completely fine?',
    ],
    experiment:
      'Spend thirty minutes this week on something you are a beginner at. Protect it like a meeting.',
  },
  {
    id: 'financial-stewardship',
    order: 7,
    name: 'Financial Stewardship',
    group: 'build',
    definition: 'The skill of creating enough financial stability, capability and optionality that money supports your life rather than chronically threatening it.',
    coreQuestion: 'Does the way I earn, spend, save and relate to money create security and possibility?',
    questions: [
      'I make financial decisions in a way that supports both my current life and my future freedom.',
      'I know where my money actually goes.',
      'My spending generally reflects what I say matters to me.',
      'Money is not a constant background stress in my life.',
    ],
    lowerFeelsLike:
      "Money taking up mental space you would rather use elsewhere. Earning more without feeling more secure. Spending that doesn't quite match what you say you value.",
    strongerCreates:
      'Money doing its actual job, which is creating options. Decisions made from choice instead of pressure. Mental bandwidth back.',
    reflectionQuestions: [
      'Does money feel like a resource in your life, or a source of ongoing tension?',
      'What would change if money were a settled question for the next two years?',
      'Where does your spending disagree with your stated priorities?',
    ],
    experiment:
      'Look at last month’s spending and find one thing you would genuinely rather have spent differently. Change that one thing this month.',
  },
  {
    id: 'contribution',
    order: 8,
    name: 'Contribution',
    group: 'build',
    definition: 'The skill of using your time, resources, abilities or care in ways that positively affect something beyond yourself.',
    coreQuestion: 'Who or what is better because I am here?',
    questions: [
      'I regularly use my time, abilities or resources in ways that positively affect people beyond myself.',
      'I can point to people or things that are better because I showed up.',
      'The contribution I make is something I have chosen, not something I feel obligated to.',
      'I feel useful in a way that matters to me.',
    ],
    lowerFeelsLike:
      'Contribution that feels transactional or obligatory. Giving a lot and feeling depleted by it rather than fed by it. Being unsure whether any of it is landing.',
    strongerCreates:
      'The knowledge that your existence is making a dent. Generosity that returns something. Work and care that outlast the day you did them.',
    reflectionQuestions: [
      'Who is measurably better off because you are here?',
      'Is your current giving something you chose, or something you inherited?',
      'What would you contribute if you were certain it mattered?',
    ],
    experiment:
      'Do one useful thing for someone this week that nobody asked you for and nobody will find out about.',
  },
  {
    id: 'aliveness',
    order: 9,
    name: 'Aliveness',
    group: 'experience',
    definition: 'The skill of noticing, creating and fully experiencing positive moments through play, novelty, adventure, gratitude, awe, curiosity and savoring.',
    coreQuestion: 'How skilled am I at actually feeling alive inside my own life?',
    questions: [
      'I regularly create or notice moments that make me feel genuinely alive.',
      'When something good is happening, I am actually there for it.',
      'There is play and novelty in my life, not just productivity.',
      'I notice and savor good things rather than moving straight to what is next.',
    ],
    lowerFeelsLike:
      "A good life you are not quite present for. Photographs of moments you don't fully remember. Moving to the next thing before finishing the current one.",
    strongerCreates:
      'Actually being there for your own life. More moments that register. The difference between a life that looks good in review and one that feels good while it is happening.',
    reflectionQuestions: [
      'When did you last feel fully absorbed in something?',
      'What used to delight you that you have stopped making room for?',
      'Are you present for the good parts, or already planning the next thing?',
    ],
    experiment:
      'Pick one ordinary good moment this week and stay in it thirty seconds longer than you normally would.',
  },
];

/** Skills in their grouped presentation order, for the framework page. */
export function skillsByGroup(groupId: SkillGroupId): Skill[] {
  return skills.filter((s) => s.group === groupId);
}
