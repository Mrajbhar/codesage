# CodeSage

AI-powered code review for GitHub pull requests. Connect a repository, and CodeSage maps your codebase, reviews each pull request against it, and posts its findings back on the PR — automatically.

**Live demo:** [codesage-plum.vercel.app](https://codesage-plum.vercel.app)

---

## Demo account

For trying the app without signing up:

```
Email:    mohan@gmail.com
Password: Pass@123
```

> This is a shared demo account with sample data only. Please don't store anything sensitive in it, and don't reuse this password elsewhere.

---

## Features

### Authentication & accounts
- Email + password sign-up and login with JWT access/refresh tokens
- **GitHub OAuth** and **Google OAuth** sign-in
- **Email verification** on sign-up (verification link required before login)
- Forgot-password / reset-password flow via email
- Account settings: change password, change email, manage connected accounts, delete account
- Rate limiting on auth endpoints

### Code review (the core)
- **Automated PR review** — enable auto-review for a repo; when a pull request is opened, reopened, or updated, CodeSage reviews the diff via a GitHub webhook and posts its findings as a comment on the PR
- **On-demand review** — pick any open pull request and run an AI review manually
- **Review detail** — every review is saved with a summary and per-file findings, color-coded by severity (critical / warning / suggestion / info)
- **Per-repo review settings** — minimum severity threshold, ignore paths/globs, allowed file types, and whether to post results back to GitHub
- Review history with pagination

### Codebase intelligence
- **Codebase map** — visual graph of repositories, languages, and commit activity
- **Semantic search** — index a repository and search it by meaning using vector embeddings
- GitHub integration: repositories, pull requests, diffs, commits, and posting PR comments

### Organizations & teams
- Multi-tenant **organizations** with per-org data isolation
- **Team invitations** (email + in-app accept flow)
- Roles (admin / member) and member limits per plan
- Organization switcher

### Billing
- **Razorpay** integration with subscription and one-time payment modes
- Plan catalog (Free / Pro / Team) with monthly AI-review **quotas**
- Atomic quota enforcement (race-safe) with refunds on failed AI calls
- Usage tracking and billing event history via webhooks

### Dashboard & insights
- Two-column dashboard with stat cards, codebase map, recent reviews, and a 7-day review-activity chart
- Onboarding checklist for new accounts
- **Analytics** page
- **Activity / audit log** with server-side search and pagination

### Real-time & notifications
- **Live notifications** via SignalR (reviews, invites, indexing updates)
- Notification history with "load older" pagination
- Background jobs via Hangfire (auto-review processing, audit-log cleanup)

### Platform
- **Admin** area (platform admin only)
- Transactional email via **Brevo** (API or SMTP), with a console fallback for local dev
- Docs, Changelog, and Privacy pages
- Responsive design with consistent theming and a custom animated auth backdrop

### Security
- JWT auth with short-lived access tokens and refresh tokens
- Rate limiting (auth endpoints + global)
- Hangfire dashboard locked to admins in production
- GitHub webhook signature verification (HMAC-SHA256)
- Secrets supplied via environment variables, never committed

---

## Tech stack

**Frontend**
- React 18 + TypeScript
- Vite
- React Router
- SignalR (live notifications)
- Deployed on Vercel

**Backend**
- .NET 10 Web API (C#)
- MongoDB (data) via MongoDB.Driver
- Hangfire (background jobs) on MongoDB storage
- SignalR (real-time hub)
- JWT authentication + GitHub & Google OAuth
- Deployed on Render (Docker)

**Integrations**
- GitHub (repos, pull requests, diffs, PR comments)
- OpenAI-compatible AI endpoint (works with Ollama locally)
- Brevo (transactional email)
- Razorpay (billing)

---

## Running locally

### Prerequisites
- Node.js 18+
- .NET 10 SDK
- MongoDB (local or Atlas)
- An OpenAI-compatible AI endpoint (e.g. [Ollama](https://ollama.com))

### Backend

```bash
cd CodeSage.Api
dotnet restore
dotnet run
```

The API expects configuration in `appsettings.Development.json` (gitignored). Copy the structure from `appsettings.json` and fill in your own values:

- `MongoDb:ConnectionString` — your MongoDB connection string
- `Jwt:Key` — a long random secret (32+ characters)
- `OAuth:GitHub` / `OAuth:Google` — your OAuth app credentials
- `Ai:BaseUrl` / `Ai:Model` — your AI endpoint (e.g. `http://localhost:11434/v1` for Ollama)

### Frontend

```bash
cd client
npm install
npm run dev
```

Set `VITE_API_URL` in `client/.env` to point at your API (e.g. `https://localhost:7147/api`).

---

## Configuration & secrets

Secrets are **never** committed. The repo's `appsettings.json` contains the config *structure* with empty values; real secrets are supplied via environment variables in deployment.

Environment variables use `__` (double underscore) to map to nested config keys, for example:

```
MongoDb__ConnectionString=mongodb+srv://...
Jwt__Key=...
OAuth__GitHub__ClientId=...
OAuth__Google__ClientSecret=...
Email__Provider=brevo
Email__ApiKey=...
App__FrontendBaseUrl=https://codesage-plum.vercel.app
App__ApiBaseUrl=https://your-api.onrender.com
```

---

## Project structure

```
codesage/
├── client/            # React + TypeScript frontend (Vite)
│   ├── src/
│   │   ├── pages/     # Dashboard, Repositories, Review detail, Settings, ...
│   │   ├── components/
│   │   └── api/
│   └── vercel.json    # SPA routing rewrite
└── CodeSage.Api/      # .NET 10 Web API
    ├── Controllers/
    ├── Services/
    ├── Models/
    ├── Jobs/          # Hangfire background jobs (auto-review)
    └── Dockerfile
```

---

## Status

This is an actively developed project built as a full-stack portfolio piece. Core features are complete and deployed. Areas still in progress: automated test coverage, httpOnly refresh-token cookies, and a production-reviewed privacy policy.

---

## License

This project is for demonstration and portfolio purposes.