// Results-page copy verified live against lifeoverflow-orhutjru.manus.space
// on 2026-08-12 (tested at overflow-capacity values 2.0, 4.0, 4.7, 6.0, 8.0,
// 9.0 to confirm band boundaries and exact wording). The locally bundled
// build in legacy/overflow-assessment/ was stale and does not match; do not
// use it as a source.
export interface CapacityBand {
  level: number; // 1-5
  label: string;
  subtitle: string;
  paragraph: string;
}

export const capacityBands: CapacityBand[] = [
  {
    level: 1,
    label: 'Contracted',
    subtitle: 'Your capacity is carrying too much.',
    paragraph: 'This is not a verdict. It is a signal that one or more conditions are consuming more of you than they return. The first move is not reinvention, it is reducing the demand at the leak.',
  },
  {
    level: 2,
    label: 'Coping',
    subtitle: 'Functional is not the same as resourced.',
    paragraph: 'You are making it work, but your score pattern suggests a life that may be costing more energy than it gives back. Stabilize one leak before you optimize anything else.',
  },
  {
    level: 3,
    label: 'Comfortable',
    subtitle: 'Some things are working. Reserve is the question.',
    paragraph: 'Comfort can disguise a lack of surplus. Your next level is not another accomplishment; it is examining the areas that have become merely tolerable.',
  },
  {
    level: 4,
    label: 'Complete',
    subtitle: 'You have built a life with real support.',
    paragraph: 'Much of the system is working. The work now is to protect the conditions that replenish you and to address the one area that could quietly drain what you have built.',
  },
  {
    level: 5,
    label: 'Overflowing',
    subtitle: 'You are operating from meaningful reserve.',
    paragraph: 'Your scores suggest broad, supported capacity. Protect the practices and relationships that allow you to lead, give, and live without disappearing from your own life.',
  },
];

// Overflow capacity (harmonic mean of the 9 scores) -> band level.
// Verified boundaries: 2.0->1, 4.0->2, 4.7->2, 6.0->3, 8.0->4, 9.0->5.
export function bandForCapacity(capacity: number): CapacityBand {
  const level = Math.min(5, Math.max(1, Math.floor((capacity - 1) / 2) + 1));
  return capacityBands[level - 1];
}

export const assessmentIntro = {
  eyebrow: 'A research-informed reflection',
  kicker: 'The Overflow Assessment',
  heading: 'Your cup must not just be full.',
  headingEmphasis: 'It must overflow.',
  body1: 'Nine skills. One honest look at the conditions that make a fulfilling life sustainable.',
  body2: 'You will score the parts of life that most shape your capacity to lead, give, and live without disappearing from your own life. This takes about six minutes.',
  ctaLabel: 'Begin the assessment',
  privacyNote: 'Private by design. No email required.',
  disclaimer: 'This is a starting point, not a diagnosis. Your results are a self-reflection tool, not a clinical assessment or prediction.',
};

export const assessmentQuestionCopy = {
  encouragement: 'There is no right answer. There is only an honest one.',
  eyebrow: 'Take a real look',
  scoreLabel: 'Your score today',
  chooseLabel: 'Choose your score',
  hint1: 'Use the scale or select a number. Do not score the version of you other people see.',
  hint2: 'Take your time. You can revise any score.',
  back: 'Back',
  continue: 'Continue',
  finish: 'Reveal my pattern',
};

export const resultsCopy = {
  eyebrow: 'Your Overflow Assessment',
  startOver: 'Start again',
  capacityHeading: 'Your current capacity',
  capacitySubheading: 'The result is not the number. It is what the pattern makes visible.',
  currentLevelLabel: 'Current level',
  overflowCapacityLabel: 'Overflow capacity',
  leverageLabel: 'Primary leverage point',
  leverageBody: (score: number) => `At ${score}/10, this is the place most likely to be draining sustainable fulfillment.`,
  supportLabel: 'Your source of support',
  supportBody: (name: string, score: number) => `${name} scored ${score}/10. Do not take it for granted; it may be helping the rest of the system hold.`,
  changesHeading: 'What changes first',
  changesSubheading: 'Find the leak. Then decide what changes.',
  nextMoves: (leverageName: string) => [
    `Name the pattern. Read the reflection question for ${leverageName} again. The first honest answer is usually more useful than another strategy.`,
    'Choose a seven-day experiment. Make one conversation, boundary, or practice small enough to try this week and specific enough to notice.',
    'Protect your support. Your strongest area is not a reward for good behavior; it is part of the infrastructure that lets the rest of your life work.',
  ],
  ledgerHeading: 'The Tidal Ledger',
  ledgerSubheading: 'Your 9 Skills, at a glance.',
  ledgerExplainer: 'Scores of six or below are marked as leaks. They are not failures; they are the most likely places to find leverage.',
  ledgerTag: (score: number, isMax: boolean) => (isMax ? 'Source of support' : score <= 6 ? 'Leak to examine' : 'Holding steady'),
  moveHeading: 'Your next decisive move',
  moveSubheading: 'Turn the leak into a plan.',
  moveBody: (leverageName: string) => `Your biggest leak right now is ${leverageName}. A Clarity Call is the fastest way to turn that into an actual plan.`,
  moveCta: 'Book your Clarity Call',
  emailHeading: 'Want a copy of this result?',
  emailBody: "Enter your email and we'll send a copy of these results straight to your inbox. It is optional, and nothing on this page is gated behind it.",
  emailCta: 'Email my result',
  emailError: 'Enter a valid email address to prepare your result email.',
  footer: 'Life 2.0 · The Overflow Assessment · A starting point, not a diagnosis.',
};
