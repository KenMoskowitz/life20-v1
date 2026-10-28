// Real client video testimonials. Shared by /working-with-laura (full video
// player) and the offer pages (quote cards), so a quote can only ever be
// edited in one place.

export interface Testimonial {
  name: string;
  title: string;
  videoId: string;
  quote: string;
}

export const testimonials: Testimonial[] = [
  {
    name: 'Brett W.',
    title: 'Owner & Founder, D&H Air Conditioning, Heating, & Plumbing',
    videoId: 'gb-XcTk8Iuc',
    quote: 'Working with Laura Kelly has been an exponential boost to who I am as a person, as a leader, as a husband.',
  },
  {
    name: 'Angela C.',
    title: 'Owner & Founder, Unique Genius',
    videoId: 'XJQMTBq1wcM',
    quote: 'Laura has such a warm heart and light spirit that is contagious. … Be ready to take your life to the next level.',
  },
  {
    name: 'Ken M.',
    title: 'Owner & Founder, Ad Zombies',
    videoId: 'IL-xZ1JxtuQ',
    quote: 'It’s amazing to me to watch her work and to watch the transformation of people who work with her.',
  },
  {
    name: 'Keith M.',
    title: 'Owner & Founder, Ethical Influence Global',
    videoId: 'lJ3Uqx_bWqs',
    quote: 'There’s a genuine nature to her, about the way that she’s going about this work, that is unique. It’s rare.',
  },
];
