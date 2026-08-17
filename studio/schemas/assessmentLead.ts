import { defineType, defineField } from 'sanity';

// Captured whenever someone requests an emailed copy of their Fulfillment
// Assessment results. Not a form submission Laura needs to action one by one,
// just visibility into who is engaging with the assessment and which of the
// 9 Skills is coming up as the one to explore first.
export default defineType({
  name: 'assessmentLead',
  title: 'Assessment Lead',
  type: 'document',
  fields: [
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'exploreSkill', title: 'Skill to explore first', type: 'string' }),
    defineField({ name: 'exploreScore', title: 'Score for that skill', type: 'number' }),
    defineField({ name: 'strengthSkill', title: 'Most developed skill', type: 'string' }),
    defineField({ name: 'strengthScore', title: 'Score for that skill', type: 'number' }),
    defineField({
      name: 'scores',
      title: 'All 9 skill scores',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'skill', title: 'Skill', type: 'string' }),
            defineField({ name: 'score', title: 'Score', type: 'number' }),
          ],
          preview: { select: { title: 'skill', subtitle: 'score' } },
        },
      ],
    }),
    defineField({ name: 'submittedAt', title: 'Submitted at', type: 'datetime', readOnly: true }),
  ],
  orderings: [{ title: 'Newest first', name: 'submittedAtDesc', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'email', subtitle: 'exploreSkill' },
  },
});
