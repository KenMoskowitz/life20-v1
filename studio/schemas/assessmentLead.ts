import { defineType, defineField } from 'sanity';

// Captured whenever someone requests an emailed copy of their Overflow
// Assessment results. Not a form submission Laura needs to act on
// individually, just visibility into who's engaging with the assessment.
export default defineType({
  name: 'assessmentLead',
  title: 'Assessment Lead',
  type: 'document',
  fields: [
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'currentLevel', title: 'Current level', type: 'number' }),
    defineField({ name: 'overflowCapacity', title: 'Overflow capacity', type: 'number' }),
    defineField({ name: 'bandLabel', title: 'Capacity band', type: 'string' }),
    defineField({ name: 'leverageSkill', title: 'Primary leverage point', type: 'string' }),
    defineField({ name: 'supportSkill', title: 'Source of support', type: 'string' }),
    defineField({
      name: 'scores',
      title: 'All 9 scores',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'skill', title: 'Skill', type: 'string' }),
            defineField({ name: 'score', title: 'Score', type: 'number' }),
          ],
        },
      ],
    }),
    defineField({ name: 'submittedAt', title: 'Submitted at', type: 'datetime', readOnly: true }),
  ],
  orderings: [{ title: 'Newest first', name: 'submittedAtDesc', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'email', subtitle: 'bandLabel' },
  },
});
