# ORHAN Studio

ORHAN Studio portfolio site and project application form. The site is served as static assets by a Cloudflare Worker; form submissions are sent through Resend, including permitted attachments.

## Project structure

- `public/index.html` — portfolio homepage
- `public/basvuru.html` — application form and success screen
- `src/index.js` — form validation and Resend email endpoint (`/api/submit`)
- `wrangler.toml` — Cloudflare Worker, static asset, and custom domain configuration

## Deploy

Install Node.js, then authenticate with Cloudflare and deploy from this directory:

```sh
npx wrangler login
npx wrangler deploy
```

Set the Resend API key as an encrypted Worker secret before deploying to a new Cloudflare environment:

```sh
npx wrangler secret put RESEND_API_KEY
```

Never put API keys in the website files, Git history, or `.dev.vars`. Local secret files are excluded by `.gitignore`.
