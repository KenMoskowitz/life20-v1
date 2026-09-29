// Read-only check that a new Circle member gets access to the whole community.
//
// The website invites purchasers without naming any spaces, so what they can
// see is decided by Circle's "default spaces" setting. This lists every space
// and flags any a new member would NOT be added to.
//
// Usage (from web/, with CIRCLE_API_TOKEN in web/.env):
//   node --env-file=.env scripts/check-circle-access.mjs
//
// Uses 2–3 Circle API requests (Business plan allows 5,000/month).

const token = process.env.CIRCLE_API_TOKEN;
if (!token) {
  console.error('CIRCLE_API_TOKEN is not set. Add it to web/.env (never commit it).');
  process.exit(1);
}

const base = 'https://app.circle.so/api/admin/v2';

async function get(path) {
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.message ?? body?.errors ?? '';
    if (res.status === 403) {
      console.error(`Circle refused the token (403): ${msg}\nAdmin API v2 needs Circle's Business plan or above and an "Admin V2" token.`);
    } else {
      console.error(`Circle ${path} failed (${res.status}): ${msg}`);
    }
    process.exit(1);
  }
  return body;
}

const community = await get('/community');
const defaults = new Set(community?.community_setting?.default_space_ids ?? community?.default_space_ids ?? []);

const spaces = [];
for (let page = 1; ; page++) {
  const body = await get(`/spaces?page=${page}&per_page=100`);
  spaces.push(...(body.records ?? []));
  if (!body.has_next_page) break;
}

console.log(`Community: ${community.name} (${community.is_private ? 'private' : 'public'})`);
console.log(`Default spaces for new members: ${defaults.size}\n`);

let gaps = 0;
for (const space of spaces) {
  if (space.is_draft) continue;
  const inDefaults = defaults.has(space.id);
  // Open spaces can be joined by any member even if not a default; private
  // or hidden ones need the member to be added, so they must be defaults.
  const restricted = space.is_private || space.is_hidden_from_non_members;
  const ok = inDefaults || !restricted;
  if (!ok) gaps++;
  const access = restricted ? 'private' : 'open';
  console.log(`${ok ? 'OK ' : 'GAP'}  ${space.name}  [${access}${inDefaults ? ', default' : ''}]`);
}

console.log(
  gaps
    ? `\n${gaps} private space(s) are not in the defaults. New members won't get them. In Circle, mark each one as a default space for new members, then run this again.`
    : '\nEvery private space is a default space, so new members get the whole community.',
);
