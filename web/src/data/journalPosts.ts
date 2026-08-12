// Fallback journal content used until Sanity's journalPost collection is wired up
// (see docs/master-plan.md Section 6/10.8). Migrated verbatim from the live site.
export interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string; // ISO date
  category: string;
  readTime: string;
  body: string[];
}

export const journalPosts: JournalPost[] = [
  {
    slug: 'strategy-isnt-coldness-its-care',
    title: "Strategy Isn't Coldness. It's Care.",
    excerpt: 'On protecting sensitivity, regulating before reacting, and keeping care available for the moments that deserve it.',
    publishedAt: '2026-03-01',
    category: 'Leadership · Emotional Steadiness',
    readTime: '4 min read',
    body: [
      "My heart is one of my greatest gifts.",
      "It makes me an effective coach. It makes me a present mother. It makes me someone people feel safe with. My sensitivity isn't a weakness, it's part of what makes me good at what I do.",
      "But I've learned something that changed how I lead, how I communicate, and how I protect the people I love most: my heart needs to be protected, not from the world, but for the right moments.",
      "When Your Heart Is Hurt, Your Brain Goes Offline",
      "When you're emotionally activated, when your heart is hurting, leading with that pain doesn't make you more authentic. It makes you less effective. And honestly, less kind.",
      "Here's why: a flooded heart doesn't communicate. It reacts. Relationship researcher John Gottman writes that, during conflict, once your heart rate exceeds approximately 100 beats per minute, you may no longer be able to hear what your spouse is trying to say; constructive conversation becomes extraordinarily difficult. In that state, clear thinking, empathy, and rational communication can be harder to access.",
      "What the research says: Psychologist James Gross at Stanford has spent decades studying emotion regulation. His work describes cognitive reappraisal as deliberately changing how you understand a situation to decrease its emotional impact; across the evidence he reviewed, it was often more effective than suppression. In a separate fMRI study, affect labeling, putting feelings into words, was associated with a diminished amygdala response to negative emotional images. In other words: observing and naming what is happening can change the emotional response enough to make clear action more possible.",
      "This isn't just theory for me. I've lived it. Some of my least effective moments, as a leader, as a partner, as a communicator, have come when I led with my hurt before my head was ready.",
      "Head Moments vs. Heart Moments",
      "I've started asking myself a simple question in high-stakes situations: is this a head moment or a heart moment?",
      "Head moments, conflict, hard conversations, high-stakes decisions, require me to think clearly, not feel loudly. My job in those moments is to stay regulated, stay strategic, stay present. Not cold. Strategic.",
      "Heart moments, my children, my clients, deep connection, require me to be fully open. Fully there. Those are the moments my sensitivity is the gift.",
      "The distinction matters because I only have so much emotional capacity. If I spend it reacting to every hurt in every moment, I don't have it available for the people and situations that actually need it most.",
      "Choosing Your Head Isn't Shutting Down",
      "I want to be clear about what this is not. It's not suppression. It's not avoidance. It's not pretending you don't feel things. It's sequencing.",
      "Feel it later. Think now. Then go back and feel from a safer, more regulated place, where you can actually be heard and where you can actually hear someone else.",
      "Choosing to lead with your head when your heart is hurting is one of the most responsible things you can do. You're taking ownership of how you show up instead of outsourcing your behavior to your pain. That's not coldness. That's care.",
      "Protecting Your Heart Is Part of the Work",
      "My heart is sensitive. I love that about myself. But sensitivity is a resource, not a faucet I leave running all day. I preserve my heart for my children. For my clients. For the moments that deserve it.",
      "And in the moments that require strategy, clarity, and emotional steadiness? I choose my head. Consciously. Intentionally. That's not a betrayal of who I am. It's how I protect what matters most.",
      "The most emotionally intelligent thing you can do isn't always to lead with your feelings. Sometimes it's knowing when not to.",
    ],
  },
];
