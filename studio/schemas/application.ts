import { defineType, defineField } from 'sanity';

// Private Advisory Clarity Call applications, submitted via the form at
// /private-advisory#apply. Laura reviews these here before booking a call.
export default defineType({
  name: 'application',
  title: 'Private Advisory Application',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'context', title: "What's going on right now?", type: 'text', rows: 4 }),
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
