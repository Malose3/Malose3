# A five-minute review of my projects

I am Manuel López Serrano, a career changer applying for junior software engineering roles. This guide points to concrete work, its verification and its limits.

## 1. Product and API workflow — Claro

**[Open the repository](https://github.com/Malose3/claro-learning-companion)**

A Spanish-language learning prototype: goal → explanation → worked example → three questions → feedback. Prepared lessons let you try the core workflow without an API key.

- [Product decisions and a debugging example](https://github.com/Malose3/claro-learning-companion/blob/main/CASE_STUDY.md): scope, runtime validation, browser storage and a Windows API-key setup failure.
- [Architecture and verification instructions](https://github.com/Malose3/claro-learning-companion#how-it-works): React/TypeScript, server-side Gemini calls and Zod validation.
- [GitHub Actions](https://github.com/Malose3/claro-learning-companion/actions): inspect the run and commit rather than relying on a static claim.
- [Recorded browser-check results](https://github.com/Malose3/claro-learning-companion/blob/main/docs/evidence/browser-results.json): evidence from an earlier run, not a live service monitor.

With Node.js 24 and npm, in a new checkout:

```sh
git clone https://github.com/Malose3/claro-learning-companion.git
cd claro-learning-companion
npm ci
npm run check
npm run dev
```

Open the local URL printed by Vite. Start with a labelled prepared lesson. Live AI generation requires your own server-side Gemini key; the README explains configuration. Browser checks have separate setup requirements.

**Boundary:** the repository is not a public hosted demo. AI tests mock the provider. The recorded live request demonstrates connectivity, not educational effectiveness. Supabase is optional and unverified. Rate limiting is process-local.

## 2. Club application architecture and a data-validation sample

**[Technical application review](https://github.com/Malose3/swim-club-case-study/blob/main/TECHNICAL_REVIEW.md)** · **[Short video](https://github.com/Malose3/swim-club-case-study/blob/main/media/presentacion-publica-segura.mp4)** · **[Sample and instructions](https://github.com/Malose3/swim-club-case-study/tree/main/examples/swim-times)**

The sample accepts inputs such as `1:02,35` and `62.35`, normalises them to `01:02.35` and rejects `1:60`. It uses integer hundredths and a strict input contract.

With Node.js 22 or later:

```sh
git clone https://github.com/Malose3/swim-club-case-study.git
cd swim-club-case-study
node examples/swim-times/demo.mjs
node --test examples/swim-times/swim-times.test.mjs
```

**Boundary:** an isolated educational adaptation built with AI assistance. It is not the complete club app, and its tests do not establish that the private application is production-ready.

## 3. A small automation problem — fictional CRM records

**[Technical walkthrough](AUTOMATION_REVIEW.md)** · **[Sample and instructions](https://github.com/Malose3/Malose3/tree/main/examples/crm-workflow)**

This sample separates valid and invalid records, handles duplicate identifiers and emails, and proposes tasks for human review. Dates are evaluated against a fixed reference so the demo is reproducible.

With Node.js 22 or later, in a separate checkout:

```sh
git clone https://github.com/Malose3/Malose3.git
cd Malose3
node examples/crm-workflow/demo.mjs
node --test examples/crm-workflow/workflow.test.mjs
```

**Boundary:** the data and rules are fictional. The script prints suggestions locally; it does not send messages, update a CRM or demonstrate measured business savings.

## Contribution and interview discussion

I identified needs and priorities, guided iterations and gave feedback on results. AI assistants generated substantial implementation, tests and documentation. Claro's case study records this division explicitly.

Useful topics for discussion:

- Why keep the API key on the server?
- What can runtime validation catch that TypeScript cannot?
- Why use integer hundredths for swimming times?
- What should happen to duplicate or invalid records?
- What would make retries safe if a local script were connected to a real system?

These are topics I am preparing to explain, not a claim that I have already passed an independent technical assessment. I am strengthening algorithms, data structures and coding fluency alongside these projects.

[Return to my profile](https://github.com/Malose3)
