# Agent guide — Portfolio

This file contains project-specific context for coding agents working on this Next.js portfolio.

## Architecture

- **App Router**: all pages live under `app/[locale]/` with `next-intl` (`localePrefix: "always"`).
- **Server Actions**: business logic is in `actions/` (`auth.ts`, `blog.ts`, `contact.ts`, `imageUploader.ts`).
- **Data access**: `lib/data.ts` is the only place that queries MongoDB directly.
- **Session**: custom JWT session stored in an `httpOnly` cookie named `session` (`lib/session.ts`).
- **Database**: MongoDB via native driver (`lib/mongodb.ts`). Migrations are versioned in `migrations/` and run automatically at build time via `scripts/migrate.ts` (tracked in `migrations` collection) — no index creation at runtime.
- **Image storage**: Cloudflare R2 via `lib/r2.ts`. Uploaded images are converted to WebP with `sharp` and served from a dedicated public R2 hostname.

## Security rules

1. **Never expose secrets in URLs or client code.** `SIGNIN_SECRET` is only used server-side to gate `/{locale}/auth/signin/[secret]`.
2. **Sanitize HTML server-side.** Use `sanitizeHtml()` from `lib/sanitize.ts` before storing any rich text. Client-side DOMPurify is optional defense-in-depth.
3. **Validate file uploads.** Use the hardened `uploadImage` / `deleteImage` in `actions/imageUploader.ts`:
   - whitelist MIME types + magic bytes
   - size limit (5 MB)
   - WebP conversion with `sharp`
   - UUID filename
   - path traversal check on delete
4. **Escape user input for MongoDB `$regex`.** Use `escapeRegex()` / `sanitizeSearchQuery()` patterns from `lib/data.ts`.
5. **Admin routes** (`/{locale}/blog/manage/*`) are protected by `getSession()` checks in server actions and by the admin layout (`app/[locale]/blog/manage/layout.tsx`). `proxy.ts` only handles i18n routing (next-intl) and is not a security boundary.

## Conventions

- Use TypeScript strictly; run `npx tsc --noEmit` after changes.
- Run `./node_modules/.bin/eslint .` before committing.
- Prefer Server Actions over API routes for form submissions.
- Keep UI components in `components/ui/` and page sections in `components/shared/`.
- Tailwind classes should follow the existing utility-first style.

## Gotchas

- Always use the Next.js MCP tools first when they can answer a question about the project.
- `proxy.ts` replaces the deprecated `middleware.ts` convention in Next.js 16.3+ and currently only handles i18n routing (next-intl). There is no rate limiting at the edge; admin protection is enforced at the layout/action layer.
- When running under Docker Compose (`../docker-compose.yml`), `MONGODB_URI` is overridden to use the `mongo` service host instead of `localhost`.
- Uploaded images are stored on Cloudflare R2 (`lib/r2.ts`), not in `public/images/`. The `R2_PUBLIC_URL` must be a dedicated public hostname, not the app domain or the S3 API endpoint.
- `sharp` is required server-side for image optimization; it is declared in `package.json`.
- Migrations run automatically on `npm run build` / Vercel deploy. For a local build without MongoDB use `SKIP_MIGRATIONS=1 npm run build`.
- The build fetches MongoDB data at build time. If MongoDB is unavailable, dynamic routes fall back to runtime rendering.
- `.env.local` must never be committed. `env.example` is the source of truth for required variables.
- The up-to-date Next.js documentation for the installed version lives in `node_modules/next/dist/docs/`.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `dist/docs/` before writing any code. Heed deprecation notices.
