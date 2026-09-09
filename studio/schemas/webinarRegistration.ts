import { defineType, defineField } from 'sanity';

// One row per person who registers for a webinar from its landing page.
export default defineType({
  name: 'webinarRegistration',
  title: 'Webinar Registration',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'webinarTitle',
      title: 'Registered for',
      type: 'string',
      readOnly: true,
      description: 'Captured at the time of registration so the record still reads correctly if the webinar is later renamed.',
    }),
    defineField({ name: 'submittedAt', title: 'Registered at', type: 'datetime', readOnly: true }),
    defineField({
      name: 'confirmationSent',
      title: 'Confirmation email sent',
      type: 'boolean',
      readOnly: true,
      description: 'False means the registration saved but the confirmation email did not go out.',
    }),
  ],
  orderings: [{ title: 'Newest first', name: 'submittedAtDesc', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'name', subtitle: 'email' },
  },
});
