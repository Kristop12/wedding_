# Wedding

Digital wedding invitations and guest management. Couples use an installable dashboard. Guests open a normal link and do not need an account.

Couples can register, create a wedding, and manage guests. A guest opens `/i/[token]` to see the Rustic envelope, wax seal, and invitation card, then the wedding page. From that invitation they can reply and view gift details. The published page is also at `/w/[slug]`. The couple dashboard can be installed. Gallery uploads and music uploads are not implemented yet.

## Requirements

- Node.js 20+
- npm
- Docker, for the local MySQL 8 database

## Installation

```bash
npm install
cp .env.example .env
```

Set `AUTH_SECRET` in `.env` to a random string of at least 32 characters:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Environment variables

| Name                   | Required | Purpose                                                 |
| ---------------------- | -------- | ------------------------------------------------------- |
| `DATABASE_URL`         | Yes      | MySQL connection string                                 |
| `SHADOW_DATABASE_URL`  | Local    | Root URL so Prisma Migrate can create a shadow database |
| `NEXT_PUBLIC_APP_URL`  | Yes      | Public app URL, also used as the auth base URL          |
| `AUTH_SECRET`          | Yes      | Session signing secret, at least 32 characters          |
| `R2_ACCOUNT_ID`        | No       | Cloudflare R2 account, reserved for uploads             |
| `R2_ACCESS_KEY_ID`     | No       | R2 access key                                           |
| `R2_SECRET_ACCESS_KEY` | No       | R2 secret                                               |
| `R2_BUCKET`            | No       | R2 bucket name                                          |
| `R2_PUBLIC_URL`        | No       | Public base URL for stored files                        |

Do not commit `.env`. Passwords are stored by Better Auth on the account record, not as a `passwordHash` column on the user.

## Database setup

Start MySQL:

```bash
docker compose up -d
```

The local database is `wedding` on port `3306`.

- Application user: `wedding` / `wedding`
- Prisma Migrate shadow database: `root` / `root`, set as `SHADOW_DATABASE_URL`

`SHADOW_DATABASE_URL` is only for local migrations. The application connects with `DATABASE_URL`.

## Prisma migration

```bash
npx prisma migrate dev
```

Apply existing migrations in production with:

```bash
npx prisma migrate deploy
```

## Seed database

```bash
npm run db:seed
```

The seed is idempotent. It creates a local demo owner and the Kent & Maria wedding:

- Email: `demo@example.com`
- Password: `WeddingDemo123!`
- Slug: `kent-and-maria`
- Santos invitation token: `7HD29MXQK4N8`

These credentials are for local development only. The seed is Kent and Maria on December 12, 2026, at Bawbawon Beach Resort, with the Rustic theme, 2 events, 3 parties, 6 guests, 5 gallery images, and one disabled QR Ph placeholder. That placeholder is not a real account. The Santos party is Juan and Sofia, with 2 seats. Their invitation is [http://localhost:3000/i/7HD29MXQK4N8](http://localhost:3000/i/7HD29MXQK4N8). The public page is [http://localhost:3000/w/kent-and-maria](http://localhost:3000/w/kent-and-maria). Gift details stay off that public page.

## Run development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build production

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

## PWA notes

The couple dashboard is an installable app. It uses a web manifest, standalone display, icons, and a Serwist service worker. Signed-in couples can install it from the dashboard. Guests are not prompted to install. Pages already opened can load offline. Sending a reply needs a connection.

## Storage configuration

QR images upload to local `storage/` when the R2 variables are empty, and to Cloudflare R2 when those variables are set. The image is served only with a valid invitation token or a signed-in wedding member. Gallery photos and music still use links. The app does not process payments.

## Deployment

Hostinger Business and Cloud plans can run this app as a Node.js website with a MySQL database on the same account. The app listens on Hostinger’s `PORT` and applies Prisma migrations when it starts.

1. In hPanel, open Websites, then Databases, then Management. Create a MySQL database and save the database name, username, and password. From the app, the host is `localhost` and the port is `3306`.
2. Add a website and choose Node.js. Node.js 20 or 22 is fine. Build command: `npm run build`. Start command: `npm start`.
3. Add these environment variables before the first deploy, then deploy again if the first build ran without them:

| Name | Production value |
| --- | --- |
| `DATABASE_URL` | `mysql://USER:PASSWORD@localhost:3306/DATABASE` |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` |
| `AUTH_SECRET` | A new random string of at least 32 characters |

If the database password contains characters such as `@`, `#`, or `%`, encode them in the URL. Do not set `SHADOW_DATABASE_URL` on Hostinger. Leave the R2 variables empty to store QR images on the server disk. Those files can disappear when Hostinger rebuilds the app, so set the R2 variables when the QR images need to survive a deploy.

4. Point the domain at the Node.js app and turn on the free SSL certificate. `NEXT_PUBLIC_APP_URL` must be that `https` address, with no trailing slash.
5. Skip `npm run db:seed` on the public site. The demo login is for local development.

Password reset, Google login, and Apple login are intentionally not part of this phase.
