import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'clarityCallUrl', title: 'Clarity Call booking URL', type: 'url' }),
    defineField({ name: 'assessmentUrl', title: 'Assessment URL (legacy Manus iframe, unused since the native rebuild)', type: 'url' }),
    defineField({ name: 'collectiveWaitlistUrl', title: 'Collective waitlist form URL', type: 'url' }),
  ],
});
