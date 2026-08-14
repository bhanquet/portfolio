# Agent guide — Portfolio

This file contains project-specific context for coding agents working on this Next.js portfolio.

## Architecture

- **App Router**: all pages live under `app/`.
- **Server Actions**: business logic is in `actions/` (`auth.ts`, `blog.ts`, `contact.ts`, `imageUploader.ts`).
- **Data access**: `lib/data.ts` is the only place that queries MongoDB directly.
- **Session**: custom JWT session stored in an `httpOnly` cookie named `session` (`lib/session.ts`).
- **Database**: MongoDB via native driver (`lib/mongodb.ts`). A unique index on `blogs.slug` is created on first connection.

## Security rules

1. **Never expose secrets in URLs or client code.** `AUTH_SECRET` is only used server-side to gate `/auth/signin/[secret]`.
2. **Sanitize HTML server-side.** Use `sanitizeHtml()` from `lib/sanitize.ts` before storing any rich text. Client-side DOMPurify is optional defense-in-depth.
3. **Validate file uploads.** Use the hardened `uploadImage` / `deleteImage` in `actions/imageUploader.ts`:
   - whitelist MIME types + magic bytes
   - size limit (5 MB)
   - UUID filename
   - path traversal check on delete
4. **Escape user input for MongoDB `$regex`.** Use `escapeRegex()` / `sanitizeSearchQuery()` patterns from `lib/data.ts`.
5. **Rate limiting & headers** live in `proxy.ts`. Adjust limits there; do not implement ad-hoc rate limiting in actions.
6. **Admin routes** (`/blog/manage/*`) are protected by session validation in `proxy.ts` **and** by `getSession()` checks in server actions.

## Conventions

- Use TypeScript strictly; run `npx tsc --noEmit` after changes.
- Run `./node_modules/.bin/eslint .` before committing.
- Prefer Server Actions over API routes for form submissions.
- Keep UI components in `components/ui/` and page sections in `components/shared/`.
- Tailwind classes should follow the existing utility-first style.

## Gotchas

- Always use the Next.js MCP tools first when they can answer a question about the project.
- `proxy.ts` replaces the deprecated `middleware.ts` convention in Next.js 16.3+. Rate limiting, admin protection, and security headers live there.
- When running under Docker Compose (`../docker-compose.yml`), `MONGODB_URI` is overridden to use the `mongo` service host instead of `localhost`.
- Uploaded images are stored in `public/images/`. This is fine for a single-instance deployment; migrate to a CDN/S3 for scale.
- The build fetches MongoDB data at build time. If MongoDB is unavailable, dynamic routes fall back to runtime rendering.
- `.env.local` must never be committed. `env.example` is the source of truth for required variables.
- The up-to-date Next.js documentation for the installed version lives in `node_modules/next/dist/docs/`.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `dist/docs/` before writing any code. Heed deprecation notices.
