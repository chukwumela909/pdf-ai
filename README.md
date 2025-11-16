## PDF Prism

AI-powered PDF summarizer UI built with Next.js 15, Tailwind, Stack Sans Notch, and Inter. The dropzone accepts a PDF, sends it to Anthropic’s Messages API, and renders summaries + highlights purpose-built for ops/exec teams.

## Prerequisites

- Node.js 18+
- An [Anthropic API key](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

## Environment variables

Create a `.env.local` file in the project root:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

The API route `POST /api/summarize` reads this key and proxies requests to Anthropic. Never commit secrets to git.

## Install & run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, drop a PDF (or click **Upload manuscript**), and watch the status + summary panes update as the Anthropic response arrives.

## Quality checks

```bash
npm run lint
```

## Notes

- The UI falls back to deterministic summaries/highlights if the API response cannot be parsed.
- Customize the system prompt or model inside `app/api/summarize/route.ts` to fine-tune the output structure.
