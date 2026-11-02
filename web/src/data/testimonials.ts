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

// Phone-recorded client stories (YouTube Shorts), shown in a grid under the
// featured videos on /working-with-laura. The headline is each video's own
// YouTube title.
export interface StoryVideo {
  headline: string;
  name?: string;
  company?: string;
  videoId: string;
}

export const storyVideos: StoryVideo[] = [
  { headline: 'From stuck mindset to phenomenal results', name: 'Ken Moskowitz', company: 'Ad Zombies', videoId: 'Lfjl78NRRVQ' },
  { headline: 'From trapped GM to visionary CEO', name: 'Adrian Stephenson', company: 'AnyDay Heating & Cooling', videoId: 'anDolPMwAtk' },
  { headline: '“She meets me where I am every single week”', name: 'Michelle Meyers', videoId: 'f_t-b0cNvCo' },
  { headline: 'Equally impatient about your goals and dreams', name: 'Svetlana Kerasimian', company: 'Aire Serv of Pasadena', videoId: 'vb6JQwpOSfI' },
];
