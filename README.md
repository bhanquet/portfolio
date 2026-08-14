# Brian Hanquet — Portfolio

A personal portfolio and blog built with **Next.js 16** (App Router), **React 19**, **Tailwind CSS 4**, **MongoDB**, and **TipTap**.

## Tech stack

- **Framework:** [Next.js](https://nextjs.org/) 16.3 (Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + `@tailwindcss/typography`
- **Database:** MongoDB 6.x (native driver)
- **Auth:** Custom JWT session (`jose`) + bcrypt password
- **Editor:** TipTap (StarterKit + Image)
- **Email:** Resend (contact form)
- **Deployment:** Docker / any Node.js host

## Getting started

1. Copy the environment template:

   ```bash
   cp env.example .env.local
   ```

2. Fill in `.env.local`:

   - `MONGODB_URI` / `MONGODB_DB`
   - `SESSION_SECRET` and `AUTH_SECRET` — generate with `openssl rand -base64 64`
   - `AUTH_EMAIL` and `AUTH_PASSWORD` — hash the admin password with bcrypt
   - `RESEND_API_KEY` and `RESEND_FROM_EMAIL` for the contact form
   - `DOMAIN` for the sitemap and contact email

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

## Lint & type check

```bash
npm run lint
npx tsc --noEmit
```

## Project structure

```text
app/                 # Next.js App Router pages
actions/             # Server Actions (auth, blog, contact, image upload)
components/          # React components
  shared/            # Page sections (Hero, About, Contact, Projects, ...)
  ui/                # Reusable UI components
  blog/              # Blog-specific components
lib/                 # Utilities, database, session, validations, sanitize
public/              # Static assets
public/images/       # Uploaded blog images (created automatically)
public/cv.pdf        # CV placeholder — replace with your own
```

## Admin area

The admin sign-in URL is `/auth/signin/{AUTH_SECRET}`. Keep `AUTH_SECRET` confidential — it acts as the gatekeeper for the login page. Once logged in, you can create and edit blog posts at `/blog/manage`.

## Environment variables

See `env.example` for the full list.

> **Never commit `.env.local`.** It is already listed in `.gitignore`.

## Contact form

The contact form uses Resend. Make sure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set, and that the from address is verified in your Resend dashboard.

## Security notes

- Rate limiting, CSP, and security headers are applied in `middleware.ts`.
- Uploaded images are validated (MIME type, magic bytes, size limit) and renamed with a UUID.
- HTML content is sanitized server-side before being stored.
- Search queries are escaped before being passed to MongoDB `$regex`.

## License

Private — all rights reserved.
