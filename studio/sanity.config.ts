import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

export default defineConfig({
  name: 'life20',
  title: 'Life 2.0',
  projectId: '4keg86n3',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Settings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.listItem()
              .title('Navigation')
              .child(S.document().schemaType('navigation').documentId('navigation')),
            S.divider(),
            S.documentTypeListItem('page').title('Pages'),
            S.documentTypeListItem('journalPost').title('Journal Posts'),
            S.documentTypeListItem('testimonial').title('Testimonials'),
            S.divider(),
            S.documentTypeListItem('application').title('Private Advisory Applications'),
            S.documentTypeListItem('contactMessage').title('Contact Messages'),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
