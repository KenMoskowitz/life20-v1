import { defineType, defineField } from 'sanity';

// A webinar / live training landing page, driven entirely from the CMS so
// Laura can set the date, agenda and copy herself without a code change.
//
// The page at /blueprint renders defensively: any section whose content is
// empty is omitted rather than shown with placeholder text, and the page
// stays noindex until `status` is set to Upcoming or Replay. That way a
// half-filled event can never be indexed or shown to a visitor as if it
// were finished.
export default defineType({
  name: 'webinar',
  title: 'Webinar',
  type: 'document',
  groups: [
    { name: 'essentials', title: 'Essentials', default: true },
    { name: 'content', title: 'Page content' },
    { name: 'registration', title: 'Registration' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'slug',
      title: 'Page slug',
      type: 'slug',
      group: 'essentials',
      options: { source: 'title' },
      description: 'The page URL. "blueprint" publishes at thelife20.com/blueprint.',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'title',
      title: 'Webinar name',
      type: 'string',
      group: 'essentials',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'essentials',
      initialValue: 'draft',
      options: {
        list: [
          { title: 'Draft — page hidden from Google, shows a "details coming" state', value: 'draft' },
          { title: 'Upcoming — live, indexed, registration open', value: 'upcoming' },
          { title: 'Replay — live, indexed, replay offered instead of a seat', value: 'replay' },
          { title: 'Closed — hidden from Google, registration closed', value: 'closed' },
        ],
        layout: 'radio',
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'startsAt',
      title: 'Date and time',
      type: 'datetime',
      group: 'essentials',
      description: 'Stored in UTC and shown in each visitor’s own timezone. Required before the page can be set to Upcoming.',
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Length in minutes',
      type: 'number',
      group: 'essentials',
      validation: (R) => R.min(5).max(600),
    }),
    defineField({
      name: 'priceNote',
      title: 'Price note',
      type: 'string',
      group: 'essentials',
      description: 'For example "Free to attend". Leave empty to say nothing about price.',
    }),

    defineField({
      name: 'heroHeadline',
      title: 'Headline',
      type: 'string',
      group: 'content',
      description: 'The main promise. Leave empty to fall back to the webinar name.',
    }),
    defineField({
      name: 'heroSubhead',
      title: 'Subhead',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    defineField({
      name: 'whatYouWillLearn',
      title: "What you'll learn",
      type: 'array',
      group: 'content',
      description: 'Leave empty and this whole section is left off the page.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Point', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'body', title: 'Detail', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'title', subtitle: 'body' } },
        },
      ],
    }),
    defineField({
      name: 'whoThisIsFor',
      title: 'Who this is for',
      type: 'array',
      group: 'content',
      description: 'Leave empty and this section is left off the page.',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'hostNote',
      title: 'About the host',
      type: 'text',
      rows: 4,
      group: 'content',
      description: 'A short note about Laura for people meeting her for the first time.',
    }),
    defineField({
      name: 'replayNote',
      title: 'Replay note',
      type: 'string',
      group: 'content',
      description: 'For example "Can’t make it live? Register anyway and we’ll send the replay."',
    }),

    defineField({
      name: 'ctaLabel',
      title: 'Button label',
      type: 'string',
      group: 'registration',
      initialValue: 'Save my seat',
    }),
    defineField({
      name: 'externalRegistrationUrl',
      title: 'External registration link',
      type: 'url',
      group: 'registration',
      description: 'Optional. Set this to send people to Zoom, Kajabi or similar instead of using the on-page form. Leave empty to collect registrations here in Sanity.',
    }),
    defineField({
      name: 'confirmationMessage',
      title: 'Confirmation message',
      type: 'text',
      rows: 3,
      group: 'registration',
      description: 'Shown on the page after someone registers.',
    }),

    defineField({ name: 'metaTitle', title: 'Meta title', type: 'string', group: 'seo' }),
    defineField({ name: 'metaDescription', title: 'Meta description', type: 'text', rows: 2, group: 'seo' }),
  ],
  preview: {
    select: { title: 'title', status: 'status', startsAt: 'startsAt' },
    prepare({ title, status, startsAt }) {
      const when = startsAt ? new Date(startsAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'no date set';
      return { title, subtitle: `${status ?? 'draft'} · ${when}` };
    },
  },
});
