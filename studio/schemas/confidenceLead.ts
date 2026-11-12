import { defineType, defineField } from 'sanity';

// Captured when someone emails themselves their Confidence Gap worksheet
// answers (thelife20.com/confidence).
export default defineType({
  name: 'confidenceLead',
  title: 'Confidence Worksheets Lead',
  type: 'document',
  fields: [
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'topSix', title: 'Top six values', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'veryImportant', title: 'Values marked Very important', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'lifeChange',
      title: 'The Life Change List',
      type: 'array',
      of: [{ type: 'object', fields: [defineField({ name: 'prompt', type: 'string' }), defineField({ name: 'answer', type: 'text' })] }],
    }),
    defineField({
      name: 'domains',
      title: 'Love, work, play, health',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'area', type: 'string' }),
            defineField({ name: 'myValues', title: 'My values', type: 'text' }),
            defineField({ name: 'shortTermGoals', title: 'Short term goals', type: 'text' }),
            defineField({ name: 'mediumTermGoals', title: 'Medium term goals', type: 'text' }),
            defineField({ name: 'longTermGoals', title: 'Long term goals', type: 'text' }),
          ],
        },
      ],
    }),
    defineField({ name: 'submittedAt', title: 'Submitted at', type: 'datetime', readOnly: true }),
  ],
  orderings: [{ title: 'Newest first', name: 'submittedAtDesc', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: { select: { title: 'email', subtitle: 'name' } },
});
