import { defineType, defineField } from 'sanity';

// Captured when someone asks for an emailed copy of their Wheel of Life
// (thelife20.com/wheel, the hidden page Laura uses on Clarity Calls).
export default defineType({
  name: 'wheelLead',
  title: 'Wheel of Life Lead',
  type: 'document',
  fields: [
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'opportunity', title: 'Biggest opportunity', type: 'string' }),
    defineField({ name: 'strongest', title: 'Strongest', type: 'string' }),
    defineField({
      name: 'scores',
      title: 'Scores',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'area', title: 'Area', type: 'string' }),
            defineField({ name: 'score', title: 'Score', type: 'number' }),
          ],
        },
      ],
    }),
    defineField({ name: 'working', title: 'What is already working', type: 'text' }),
    defineField({ name: 'actions', title: 'Next steps', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'submittedAt', title: 'Submitted at', type: 'datetime', readOnly: true }),
  ],
  orderings: [{ title: 'Newest first', name: 'submittedAtDesc', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: { select: { title: 'email', subtitle: 'opportunity' } },
});
