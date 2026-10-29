# Technical Report: Cynbit Project Blueprint

Candidate: Tanishq Jain. Task: improve cynbit.in with a working prototype.

## 1. What I looked at

I went through the home, services and contact pages as a visitor and then checked the page source.

- The site is Next.js (App Router) with Tailwind-style utility classes. The home page transfers about 344 KB and finishes loading in roughly 1.3 s on my connection. Images all have alt text and there is one `h1`. Performance and basics are in good shape.
- The services page lists four service lines in detail: AI automation, software and cloud, marketing and SEO. Every "Inquire" button and every call to action ("Start discovery", "Start discovery phase") ends at `/contact`.
- The contact form has four short fields and one free-text box labelled "Your message". The page promises a 24 hour response.

## 2. The problem

A visitor who has just read about voice agents or legacy migration lands on a blank message box. The form does not know which service they came for, how big the job is, or when they need it. That has three costs:

- Visitors have to write a good brief from scratch, and many will not.
- Nothing on the site tells them whether the job is days or months, so they cannot tell if Cynbit fits.
- Cynbit's first reply has to be a round of questions (scope, stage, deadline) before any real conversation starts.

## 3. The improvement

A short wizard that does the scoping for the visitor.

1. **Service.** AI automation, software and cloud, or marketing and SEO.
2. **Scope.** Four features per service, taken from the services page (for example agents, LLM automation, voice agents, stack integration).
3. **Context.** Starting point (idea, existing product, legacy system) and target date.
4. **Blueprint.** An indicative effort range, a project tier, a suggested team and a plain-text brief. The visitor adds a name and email and sends it.

The estimate is a heuristic, not a quote. Each feature has a min and max in weeks. The longest feature counts in full and each extra one counts at 70%, because real projects share setup, auth and deployment work. A starting-point factor then scales the total: 0.85 for an existing product, 1.3 for a legacy system. If the minimum is longer than the visitor's target date, the page says so and suggests phasing the work instead of showing a happy number.

## 4. Stack and why

- **Next.js 15, TypeScript, Tailwind.** Cynbit already lists these. A component or route from this prototype can move into their site without a rewrite.
- **Pure logic in `src/lib/blueprint.ts`.** Catalogue, estimate, brief and validation are plain functions. That keeps the part that can be wrong easy to test without a browser.
- **A route handler for submit.** `/api/inquiry` validates the whole payload again on the server (service, feature ids, stage, timeline, email) instead of trusting the client. It forwards to an optional webhook, or logs, so no database or account is needed to run the demo.
- **Vitest.** Quick, no config, works with TypeScript.

## 5. Results

- 9 unit tests cover the estimate maths, the tight-timeline flag, validation and the brief text. All pass. `eslint`, `tsc` and `next build` are clean. First load JS for the page is 106 kB.
- I drove the production build in a browser: picked Software and cloud, Web or mobile app plus Cloud infrastructure, Legacy system, Within 4 weeks. The page showed 10 to 23 weeks, a Complex tier and the tight-timeline warning. By hand: (6 + 2 x 0.7) x 1.3 rounds to 10 and (14 + 5 x 0.7) x 1.3 rounds to 23. Submitting with empty fields showed both errors. Submitting with valid data returned the confirmation, and the server log showed the brief.
- Bugs found while testing, and fixed: quick successive selections were dropped because updates read stale state, the brief heading was blank before a name was typed, and the tab title was still "Create Next App".

I have not measured a conversion change, because that needs real traffic. The measurable version of this is the share of contact visits that become a submitted inquiry, plus how many first replies no longer need a scoping round.

## 6. Limits and next steps

- The week ranges are my own estimates from the services page. Cynbit should replace them with numbers from past projects. They live in one array in `src/lib/blueprint.ts`.
- Submissions are only forwarded or logged. A real version would store them and email the visitor a copy of the brief.
- The wizard is a separate app here. On the real site it belongs on `/contact`, with each "Inquire" button on `/services` opening it with the service already chosen.
- `npm audit` still reports `sharp` and a nested `postcss` inside Next.js. This app does not use `next/image`, so `sharp` is not exercised. I upgraded Next from 15.5.4 to 15.5.28, which cleared the critical finding. The rest need a major version bump, which I left alone.
