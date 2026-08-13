import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3, validation: (R) => R.required() }),
    defineField({ name: 'attribution', title: 'Attribution', type: 'string' }),
    defineField({ name: 'context', title: 'Context (e.g. Private Advisory client)', type: 'string' }),
  ],
});
