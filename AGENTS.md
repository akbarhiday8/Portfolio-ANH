# Portfolio ANH — Persistent Project Instructions

## Final architecture

The final production architecture for this repository is:

- Native Next.js
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Vercel

All new implementation work must move toward this architecture and keep the
application deployable on Vercel.

## Legacy migration sources only

The following technologies are temporary migration sources, not part of the
final runtime architecture:

- Cloudflare D1
- Cloudflare R2
- Vinext
- Cloudflare Workers and ChatGPT Sites runtime

Rules for legacy technology:

- Do not add new D1, R2, Vinext, Workers, or Sites-specific application code.
- Do not optimize future work for ChatGPT Sites compatibility.
- Do not retain dual D1/Supabase or R2/Supabase Storage backends as a permanent
  architecture. Any temporary dual-read or dual-write path must be narrowly
  scoped to an approved migration step and removed after verification.
- Preserve existing production D1 data only until it has been safely migrated
  and reconciled in Supabase PostgreSQL.
- Preserve existing media only until it has been safely migrated and verified
  in Supabase Storage.
- After migration verification, remove D1, R2, Vinext, Workers/Sites
  dependencies, bindings, configuration, and unused migration compatibility
  code.
- The old Cloudflare deployment may remain temporarily as a rollback reference,
  but the new application must not depend on it at runtime.

## Product and implementation rules

- Keep the current frontend design unchanged unless the user explicitly asks
  for a design change.
- Preserve working CMS behavior during migration: CRUD, ordering, drafts and
  publishing, revisions, validation, media handling, admin authorization,
  rate limiting provided by Supabase Auth, and JSON export.
- Prefer the simplest maintainable implementation. Avoid speculative features,
  duplicate abstractions, and unnecessary client-side JavaScript.
- Keep secrets out of Git and browser-exposed environment variables. Never use
  a Supabase service-role key in client-side code.
- Treat data migration, media migration, and runtime cutover as separate,
  verifiable steps. Do not delete legacy data or infrastructure before the
  Supabase replacement has been verified.
