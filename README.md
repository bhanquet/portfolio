# Brian Hanquet — Portfolio

A personal portfolio and blog built with **Next.js 16** (App Router), **React 19**, **Tailwind CSS 4**, **MongoDB**, **TipTap**, and **next-intl**.

## Tech stack

- **Framework:** [Next.js](https://nextjs.org/) 16.3 (Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + `@tailwindcss/typography`
- **Database:** MongoDB 6.x (native driver)
- **Auth:** Custom JWT session (`jose`) + bcrypt password
- **Editor:** TipTap (StarterKit + Image)
- **Email:** Resend (contact form)
- **i18n:** [next-intl](https://next-intl.dev/) with `en` and `fr`
- **Image storage:** Cloudflare R2 (S3-compatible)
- **Deployment:** Docker / any Node.js host

## Getting started

1. Copy the environment template:

   ```bash
   cp env.example .env.local
   ```

2. Fill in `.env.local`:

   - `MONGODB_URI` / `MONGODB_DB`
   - `SESSION_SECRET` and `SIGNIN_SECRET` — generate with `openssl rand -base64 64`
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` — hash the admin password with bcrypt
   - `RESEND_API_KEY` and `RESEND_FROM_EMAIL` for the contact form
   - `DOMAIN` for the sitemap and contact email
   - `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, and `R2_PUBLIC_URL` for image uploads
   - `NEXT_PUBLIC_SITE_URL` (production) for absolute metadata/sitemap URLs

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

MongoDB must be reachable during the build because several pages fetch data at build time. If MongoDB is unavailable, dynamic routes and the sitemap fall back to dynamic rendering.

Migrations in `migrations/` run automatically at build time (`npm run build` chains `tsx scripts/migrate.ts && next build`). Pending migrations are tracked in the `migrations` collection. To run or preview manually:

```bash
npm run migrate          # apply pending migrations
npm run migrate:dry-run  # list without applying
```

To skip migrations in a local build without MongoDB: `SKIP_MIGRATIONS=1 npm run build`.

## Lint & type check

```bash
npm run lint
npx tsc --noEmit
```

## Project structure

```text
app/[locale]/        # Next.js App Router pages with i18n routing
actions/             # Server Actions (auth, blog, contact, image upload)
components/          # React components
  shared/            # Page sections (Hero, About, Contact, Projects, ...)
  ui/                # Reusable UI components
  blog/              # Blog-specific components
i18n/                # next-intl routing and request configuration
messages/            # Translation files (en.json, fr.json)
lib/                 # Utilities, database, session, validations, sanitize, R2, SEO
public/              # Static assets
public/cv.pdf        # CV placeholder — replace with your own
 scripts/             # Build-time migration runner (`migrate.ts`)
 migrations/          # Versioned DB migrations (tracked in `migrations` collection)
```

## Admin area

The admin sign-in URL is `/{locale}/auth/signin/{SIGNIN_SECRET}` (e.g. `/en/auth/signin/...`). Keep `SIGNIN_SECRET` confidential — it acts as the gatekeeper for the login page.

Once logged in, you can create and edit blog posts at `/{locale}/blog/manage`. The editor supports side-by-side translations: each article shares a `translationGroupId` and one cover image across locales, while the title, slug, summary, content, and tags are per-locale.

## Environment variables

See `env.example` for the full list.

> **Never commit `.env.local`.** It is already listed in `.gitignore`.

## Contact form

The contact form uses Resend. Make sure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set, and that the from address is verified in your Resend dashboard.

## Security notes

- `proxy.ts` currently only handles i18n routing (`next-intl`). There is no rate limiting at the edge; add it there if needed (or at the reverse proxy) rather than ad-hoc in actions.
- Admin routes (`/blog/manage/*`) are protected by `getSession()` checks in server actions and by the admin layout. `proxy.ts` is not a security boundary.
- Uploaded images are validated (MIME type, magic bytes, size limit), converted to WebP, and stored on Cloudflare R2 with a UUID filename.
- `sharp` is used server-side to optimize images before upload.
- HTML content is sanitized server-side before being stored.
- Search queries are escaped before being passed to MongoDB `$regex`.

## License

Private — all rights reserved.
