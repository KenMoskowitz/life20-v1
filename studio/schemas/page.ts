import { defineType, defineField } from 'sanity';

// Generic CMS-editable page. Astro reads a document by slug and falls
// back to its own hardcoded copy for any field left empty here.
export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Internal title', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'slug',
      title: 'Page slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (R) => R.required(),
      description: 'Must match the route, e.g. "home", "about", "the-9-skills", "assessment", "collective", "private-advisory".',
    }),
    defineField({ name: 'metaTitle', title: 'Meta title', type: 'string' }),
    defineField({ name: 'metaDescription', title: 'Meta description', type: 'text', rows: 2 }),
    defineField({ name: 'heroLede', title: 'Hero lede (home page only)', type: 'text', rows: 3 }),
    defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
  },
});
