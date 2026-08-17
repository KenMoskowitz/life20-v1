// Copy for The Life 2.0 Fulfillment Assessment.
//
// Naming, intro and results structure follow Laura's alignment brief.
// Language rules being enforced here (brief Parts 10 and 12):
//   - Never: deficient, failing, broken, poor, unhealthy, bad at, weak.
//   - Instead: less developed, deserves attention, opportunity for
//     development, currently under-supported, skill to explore, starting point.
//   - "A starting point" over "a diagnosis". "Which skill deserves attention?"
//     over "what's wrong?". Skills are developed, practiced, strengthened.
//   - The target feeling is "oh, that makes sense", never "here's another
//     thing wrong with me".

export const assessmentIntro = {
  eyebrow: 'A reflective starting point',
  kicker: 'The Life 2.0 Fulfillment Assessment',
  supportingLine: 'Discover which of the 9 Skills of Fulfillment may deserve your attention right now.',
  body: [
    "A fulfilling life isn't one thing.",
    'You can have extraordinary relationships and feel stuck professionally. You can have financial freedom and very little aliveness. You can have purpose but struggle with regulation. You can be incredibly healthy and feel disconnected.',
    'Life 2.0 looks at fulfillment through nine learnable skills. This short assessment helps you reflect on where each skill currently stands, and identify where developing a skill may create the greatest improvement in your life right now.',
  ],
  ctaLabel: 'Begin the assessment',
  privacyNote: 'Private by design. No email required.',
  disclaimer: "This isn't a diagnosis. It's a starting point. Your results are a self-reflection tool, not a clinical assessment or prediction.",
};

export const assessmentQuestionCopy = {
  encouragement: 'There is no right answer. There is only an honest one.',
  instruction: 'Rate how true each statement feels right now, from 1 (not true) to 10 (very true). Score the life you are actually living, not the version other people see.',
  scaleLow: 'Not true',
  scaleHigh: 'Very true',
  back: 'Back',
  continue: 'Continue',
  finish: 'See my results',
  progressLabel: (current: number, total: number) => `Skill ${current} of ${total}`,
};

export const resultsCopy = {
  eyebrow: 'Your Fulfillment Assessment',
  startOver: 'Start again',

  snapshotHeading: 'Your current skill snapshot',
  snapshotIntro:
    'All nine skills, as you scored them today. Higher simply means more developed right now. None of these are meant to sit at ten, and a life can be genuinely good with real variation across the nine.',

  exploreHeading: 'Your skill to explore first',
  exploreBody: (name: string) => `Your results suggest ${name} may deserve some attention right now.`,
  exploreCaveat:
    'This is an invitation to investigate, not a verdict. It may be the most useful place to begin, and context still matters more than the number.',
  nearTieNote: (names: string[]) => {
    const list =
      names.length <= 2
        ? names.join(' and ')
        : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
    return `${list} scored close enough together that any of them would be a reasonable place to start. Begin with whichever one feels most alive in your actual week.`;
  },

  meansHeading: 'What this skill means',
  lowerHeading: 'What less development can feel like',
  strongerHeading: 'What stronger development can create',
  reflectionHeading: 'Three questions to sit with',
  experimentHeading: 'One small experiment',

  strengthHeading: 'Where you are already strong',
  strengthBody: (name: string) =>
    `${name} is your most developed skill today. Worth protecting, not taking for granted, since it is part of what lets the rest of your life work.`,

  ctaHeading: 'Want help understanding what your results mean for your actual life?',
  ctaBody:
    'The assessment creates awareness. A conversation provides context and direction. A Clarity Call is sixty minutes with Laura to talk through what your results actually mean for the life you are building.',
  ctaLabel: 'Book a Life 2.0 Clarity Call',

  emailHeading: 'Want a copy of this result?',
  emailCta: 'Email my results',
  emailError: 'Enter a valid email address so we can send your results.',
  emailSending: 'Sending...',
  emailSent: (email: string) => `Sent. Check ${email} for your results.`,
  emailFailed: "Couldn't send that email right now. Please try again in a moment.",

  footer: 'Life 2.0 · The Fulfillment Assessment · A starting point, not a diagnosis.',
};
