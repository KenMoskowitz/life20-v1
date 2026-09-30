import { defineType, defineField } from 'sanity';

// One row per Life 2.0 purchaser, written by the website's Stripe webhook
// (web/src/lib/onboarding.ts). Read-only here: the website owns these.
// "Invited" and "Signup completed" are separate on purpose: an invite only
// means Circle sent the email, not that the person has joined.
const STATUSES = [
  { title: 'Awaiting payment (bank debit processing)', value: 'awaiting_payment' },
  { title: 'Payment failed', value: 'payment_failed' },
  { title: 'Inviting…', value: 'processing' },
  { title: 'Invited (Circle invite sent)', value: 'invited' },
  { title: 'Signup completed', value: 'signup_completed' },
  { title: 'Invite failed, will retry', value: 'failed' },
  { title: 'Needs attention', value: 'needs_attention' },
];

export default defineType({
  name: 'circleOnboarding',
  title: 'Circle Onboarding',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'status', title: 'Status', type: 'string', options: { list: STATUSES } }),
    defineField({
      name: 'inviteSource',
      title: 'Invite source',
      type: 'string',
      description: '"website" = this site sent the Circle invite. "existing" = they were already a member or already invited, so nothing new was sent.',
    }),
    defineField({ name: 'invitedAt', title: 'Invited at', type: 'datetime' }),
    defineField({ name: 'signupCompletedAt', title: 'Signup completed at', type: 'datetime' }),
    defineField({ name: 'circleMemberId', title: 'Circle member ID', type: 'number' }),
    defineField({ name: 'stripeSessionIds', title: 'Stripe checkout sessions', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'attempts', title: 'Invite attempts', type: 'number' }),
    defineField({ name: 'lastError', title: 'Last error', type: 'text' }),
    defineField({ name: 'lastCheckedAt', title: 'Last checked in Circle', type: 'datetime' }),
    defineField({ name: 'lockedAt', title: 'Locked at', type: 'datetime', hidden: true }),
    defineField({ name: 'createdAt', title: 'Created at', type: 'datetime' }),
    defineField({ name: 'updatedAt', title: 'Updated at', type: 'datetime' }),
  ],
  orderings: [{ title: 'Newest first', name: 'createdAtDesc', by: [{ field: 'createdAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'email', name: 'name', status: 'status' },
    prepare: ({ title, name, status }) => ({
      title: name ? `${name} (${title})` : title,
      subtitle: STATUSES.find((s) => s.value === status)?.title ?? status,
    }),
  },
});
