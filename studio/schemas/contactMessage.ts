import { defineType, defineField } from 'sanity';

// General contact form submissions from /contact.
export default defineType({
  name: 'contactMessage',
  title: 'Contact Message',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'message', title: 'Message', type: 'text', rows: 5, validation: (R) => R.required() }),
    defineField({ name: 'submittedAt', title: 'Submitted at', type: 'datetime', readOnly: true }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['New', 'Replied', 'Archived'] },
      initialValue: 'New',
    }),
  ],
  orderings: [{ title: 'Newest first', name: 'submittedAtDesc', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'name', subtitle: 'email' },
  },
});
