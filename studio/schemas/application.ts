import { defineType, defineField } from 'sanity';

// Private Advisory applications, submitted via the form at
// /private-advisory#apply. Applicants book their Clarity Call straight away;
// Laura reads these answers before the call.
export default defineType({
  name: 'application',
  title: 'Private Advisory Application',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'work', title: 'What they do', type: 'string' }),
    defineField({ name: 'businessSize', title: 'Business size', type: 'string' }),
    defineField({ name: 'focusArea', title: 'Area of life most off', type: 'string' }),
    defineField({ name: 'context', title: "What's going on right now?", type: 'text', rows: 4 }),
    defineField({ name: 'win', title: 'What would make the next six months a win', type: 'text', rows: 3 }),
    defineField({ name: 'investReady', title: 'Ready to invest $3,000/month?', type: 'string' }),
    defineField({ name: 'source', title: 'Heard about Laura via', type: 'string' }),
    defineField({ name: 'submittedAt', title: 'Submitted at', type: 'datetime', readOnly: true }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['New', 'Reviewed', 'Call booked', 'Declined'] },
      initialValue: 'New',
    }),
  ],
  orderings: [{ title: 'Newest first', name: 'submittedAtDesc', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'name', subtitle: 'email' },
  },
});
