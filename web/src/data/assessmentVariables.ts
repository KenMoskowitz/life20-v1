// Verbatim from Life2.0_9Variables_Guide.pdf, confirmed against the live
// Manus-hosted assessment at lifeoverflow-orhutjru.manus.space (definition
// line and reflection questions match word for word).
export interface AssessmentVariable {
  id: string;
  order: number;
  name: string;
  definition: string;
  reflectionQuestion: string;
  lowAnchor: string;
  highAnchor: string;
}

export const assessmentVariables: AssessmentVariable[] = [
  {
    id: 'purpose-meaning',
    order: 1,
    name: 'Purpose & Meaning',
    definition: 'The orientation of your life toward something that transcends the immediate.',
    reflectionQuestion: 'If your life were a book, would you be compelled by where the story is heading, or does the next chapter feel like more of the same?',
    lowAnchor: 'Drifting, going through the motions, unclear what you are building toward.',
    highAnchor: 'Clear sense of direction; life feels intentional and connected to what matters.',
  },
  {
    id: 'relationships',
    order: 2,
    name: 'Relationships',
    definition: 'The quality of your close, warm, and reciprocal connections with others.',
    reflectionQuestion: 'Who in your life truly knows you, not your role or your achievements, but you? And when did you last let them in?',
    lowAnchor: 'Surface-level connection, feeling unseen, isolated even when surrounded by people.',
    highAnchor: 'Deep mutual relationships; people with whom you can be fully honest.',
  },
  {
    id: 'identity-autonomy',
    order: 3,
    name: 'Identity & Autonomy',
    definition: 'The degree to which your life is self-authored and aligned with who you actually are.',
    reflectionQuestion: 'Is the life you are living the one you chose, or the one that accumulated around you while you were busy being what others needed?',
    lowAnchor: 'Living for expectations; choices feel constrained; self is blurred by roles.',
    highAnchor: 'A strong sense of self; choices are rooted in your own values and authorship.',
  },
  {
    id: 'growth-challenge',
    order: 4,
    name: 'Growth & Challenge',
    definition: 'Your ongoing engagement with difficulty in the service of your own development.',
    reflectionQuestion: 'When did you last do something that genuinely stretched you, not performed growth, but actually felt the edge of your current capacity?',
    lowAnchor: 'Stuck in comfort zones, avoiding challenge, skills feel stagnant, bored or anxious.',
    highAnchor: 'Consistently learning, embracing difficulty, sense of forward development and expanding capacity.',
  },
  {
    id: 'physical-vitality',
    order: 5,
    name: 'Physical Vitality',
    definition: 'The condition of your body as both foundation and expression of your flourishing.',
    reflectionQuestion: 'Does your body feel like an asset, something that gives you energy, clarity, and presence, or a liability you manage around?',
    lowAnchor: 'Chronically depleted, poor sleep, sedentary, body feels like an obstacle.',
    highAnchor: 'Consistent energy, quality sleep, regular movement, physical system supporting not limiting life.',
  },
  {
    id: 'financial-security',
    order: 6,
    name: 'Financial Security',
    definition: 'The experience of adequate resources and freedom from the cognitive burden of financial stress.',
    reflectionQuestion: 'Does money feel like a resource in your life, something that creates options, or a source of ongoing tension that occupies mental space you would rather use elsewhere?',
    lowAnchor: 'Chronic financial anxiety, scarcity mindset, money restricts options and occupies mental bandwidth.',
    highAnchor: 'Financial security, adequate resources, money is not a daily stressor, future feels possible.',
  },
  {
    id: 'contribution',
    order: 7,
    name: 'Contribution',
    definition: 'The experience of positively affecting others and leaving a meaningful trace.',
    reflectionQuestion: 'Do you feel that your existence is making a dent, that people, work, or the world is measurably better because you showed up?',
    lowAnchor: 'Actions feel self-contained, unclear impact, contribution feels transactional or obligatory.',
    highAnchor: 'Clear sense of positive impact, feel genuinely useful, contribution is freely chosen and meaningful.',
  },
  {
    id: 'presence-aliveness',
    order: 8,
    name: 'Presence & Aliveness',
    definition: 'The capacity to be fully engaged with your actual life as it is being lived.',
    reflectionQuestion: "When you're in a conversation, a meal, a moment, are you actually there? Or are you somewhere else, processing, planning, evaluating, absent?",
    lowAnchor: 'Chronically distracted, mentally elsewhere, going through motions, life feels unlived.',
    highAnchor: 'Genuinely engaged with life as it happens, capacity for absorption, moments feel real and vivid.',
  },
  {
    id: 'character-virtue',
    order: 9,
    name: 'Character & Virtue',
    definition: 'The disposition to act in alignment with your values, consistently and especially under pressure.',
    reflectionQuestion: 'Are you the same person in private that you are in public? And when it costs something to be that person, do you still show up?',
    lowAnchor: 'Gap between values and actions, integrity feels situational, choices do not reflect who you want to be.',
    highAnchor: 'Consistent alignment between values and behavior, integrity holds under pressure, trust in yourself.',
  },
];
