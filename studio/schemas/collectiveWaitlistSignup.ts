import { defineType, defineField } from 'sanity';

// One row per person who joins the waitlist from /collective.
export default defineType({
  name: 'collectiveWaitlistSignup',
  title: 'Collective Waitlist Signup',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'submittedAt', title: 'Joined at', type: 'datetime', readOnly: true }),
  ],
  orderings: [{ title: 'Newest first', name: 'submittedAtDesc', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'name', subtitle: 'email' },
  },
});
