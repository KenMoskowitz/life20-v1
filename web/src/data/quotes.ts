// Written quotes from clients and colleagues, taken from public comments on
// Laura's Facebook post of October 20, 2026. Laura confirmed each person is
// happy to be quoted. Edit a quote here and it updates everywhere it's used.

export interface Quote {
  name: string;
  title?: string;
  quote: string;
}

export const quotes: Record<string, Quote> = {
  gail: {
    name: 'Gail Jennings',
    title: 'General Manager, service company',
    quote: 'In the short time I have worked with you, I have learned to have a deeper respect for myself and my ability as a leader. You helped me have the courage to speak my truth and set boundaries in my career. Thank you for believing in me and helping me to believe in myself.',
  },
  paul: {
    name: 'Paul Olsen',
    quote: 'I personally reached out to you to help me find my direction, and I have grown home services companies to over $100 mil.',
  },
  ken: {
    name: 'Ken Hale',
    quote: 'I have dealt with dozens of coaches and I still go back to the things I learned while you and Josh coached us.',
  },
  michelle: {
    name: 'Michelle Leigh Myers',
    quote: 'Your work has impacted every aspect of my life.',
  },
  indira: {
    name: 'Indira Guerrero',
    title: 'Business owner',
    quote: 'I still carry lessons from that experience into how I lead my own company today. It’s about developing people, challenging them to think bigger, and helping them become better leaders.',
  },
  erica: {
    name: 'Erica McKee Leonor',
    quote: 'Not only are you brilliant, you help bring the brilliant out of others.',
  },
  stefanie: {
    name: 'Stefanie Wright',
    quote: 'When it comes to assessing a person and how you can personally influence a real “Life 2.0” momentum shift in their personal journey, you are the GOAT.',
  },
};

// Proof points Laura has stated publicly. Keep wording exact: these are
// claims about real numbers, so don't round or embellish them.
export const proofPoints = [
  {
    figure: '$2.5B',
    label: 'Leaders Laura has personally coached run companies on track to generate $2.5 billion in revenue this year.',
  },
  {
    figure: '$170M',
    label: 'The home service companies Laura and her husband Josh are involved in are on track for $170 million this year.',
  },
  {
    figure: 'Psychology',
    label: 'Degree in psychology, Graduate of the Year, and research conducted inside Dell, Eli Lilly, Ornua and EMC.',
  },
];
