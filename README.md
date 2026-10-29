# Cynbit Project Blueprint

A four-step scoping wizard for cynbit.in. A visitor picks a service, the scope, where they are starting from and when they need it. They get an indicative timeline and team, and the same brief is sent to Cynbit.

Built with Next.js 15 (App Router), TypeScript and Tailwind, the same stack Cynbit lists on its services page.

Live demo: https://cynbit-blueprint.vercel.app

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm test        # unit tests for the estimate logic
npm run lint
npm run build
```

## Configuration

`INQUIRY_WEBHOOK_URL` (optional). When set, `/api/inquiry` forwards `{ contact, brief }` to it as JSON, for example a Slack or Zapier hook. When unset, the brief is logged on the server.

## Layout

- `src/lib/blueprint.ts` holds the service catalogue, the estimate and brief logic, and contact validation. Pure functions, no React.
- `src/components/BlueprintWizard.tsx` is the wizard UI.
- `src/app/api/inquiry/route.ts` re-validates the submission on the server and forwards it.

The write-up is in [REPORT.md](REPORT.md), with a PDF copy at [docs/Cynbit-Project-Blueprint-Report.pdf](docs/Cynbit-Project-Blueprint-Report.pdf).
