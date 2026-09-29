import { createHash } from 'node:crypto';
import type { SanityClient } from '@sanity/client';
import type { OnboardingRecord, OnboardingStore, RecordFields } from './onboarding.ts';

// Onboarding records live in Sanity next to the site's other form data, so
// they're visible in the Studio ("Circle Onboarding") and survive across
// Vercel function invocations.
//
// The document ID has a "." in it. Sanity treats dotted IDs as a private
// path: they're never returned to unauthenticated reads, even from a public
// dataset, so purchaser emails stay behind the server-side token.
const TYPE = 'circleOnboarding';

function docId(email: string) {
  return `${TYPE}.${createHash('sha256').update(email).digest('hex').slice(0, 40)}`;
}

type Doc = Omit<OnboardingRecord, 'id' | 'rev'> & { _id: string; _rev: string };

function toRecord(doc: Doc): OnboardingRecord {
  const { _id, _rev, ...rest } = doc;
  return { ...rest, id: _id, rev: _rev, stripeSessionIds: rest.stripeSessionIds ?? [], attempts: rest.attempts ?? 0 };
}

function isRevisionConflict(err: unknown) {
  const status = (err as { statusCode?: number })?.statusCode;
  return status === 409 || /revision/i.test((err as Error)?.message ?? '');
}

export function createSanityOnboardingStore(client: SanityClient): OnboardingStore {
  return {
    async ensure(email, name) {
      const _id = docId(email);
      const now = new Date().toISOString();
      const doc = await client.createIfNotExists({
        _id,
        _type: TYPE,
        email,
        name: name ?? null,
        status: 'awaiting_payment',
        stripeSessionIds: [],
        attempts: 0,
        createdAt: now,
      });
      return toRecord(doc as unknown as Doc);
    },

    async claim(record, fields) {
      try {
        await client
          .patch(record.id)
          .ifRevisionId(record.rev)
          .set({ ...fields, updatedAt: new Date().toISOString() })
          .commit();
        return true;
      } catch (err) {
        if (isRevisionConflict(err)) return false;
        throw err;
      }
    },

    async update(record, fields: RecordFields, addSessionId) {
      let patch = client.patch(record.id).set({ ...fields, updatedAt: new Date().toISOString() });
      if (addSessionId && !record.stripeSessionIds.includes(addSessionId)) {
        patch = patch.setIfMissing({ stripeSessionIds: [] }).append('stripeSessionIds', [addSessionId]);
      }
      await patch.commit();
    },

    async listForSync({ staleLockBefore, invitedSince, limit }) {
      const docs = await client.fetch<Doc[]>(
        `*[_type == $type && (
            status == "failed" ||
            (status == "processing" && lockedAt < $staleLockBefore) ||
            (status == "invited" && invitedAt > $invitedSince)
          )] | order(coalesce(lastCheckedAt, "1970-01-01") asc)[0...$limit]`,
        { type: TYPE, staleLockBefore, invitedSince, limit },
      );
      return docs.map(toRecord);
    },
  };
}
