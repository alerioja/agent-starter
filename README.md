# agent-starter

The minimal production **agent loop** from *AI Agents for Beginners* — Module 02.
Copy this repo, run it once, and you'll have a working agent that triggers,
reads a source, decides what matters, takes an action, and stops.

> Three files matter:
> - `src/run.ts` — **the loop.** The engine. Copy it forever, rarely edit it.
> - `src/prompt.md` — **the agent's job description.** You own this.
> - `src/tools.ts` — **the things the agent can DO.** You add to this.
>
> The loop is boilerplate, the prompt is the product, the tools are the leverage.

## Quick start

```bash
# 1. Clone + install
git clone https://github.com/alerioja/agent-starter.git my-first-agent
cd my-first-agent
npm install

# 2. Add your key
cp .env.example .env
#   then open .env and paste your Anthropic API key

# 3. Run it
npm start            # = npx tsx src/run.ts
```

You'll watch the agent call `read_source`, think, then call `send_digest`
and print a digest built from `source.txt`. That's a complete agent.

## How it works (the 35-line engine)

`src/run.ts` is the whole loop:

1. **Trigger** — you run the file.
2. **Context + decide** — the model reads `prompt.md` and the conversation.
3. **Act** — it calls a tool from `tools.ts`.
4. **Check** — the tool result is fed back in.
5. **Repeat** — the `while` loop continues until the model stops asking for tools, then prints its final word.

Everything else in the course is a more sophisticated version of these lines.

## Make it yours

1. **Keep `run.ts` as-is.** The loop rarely changes.
2. **Rewrite `prompt.md`** for your job. Keep the four production clauses:
   "you run unattended," an explicit "done means," an empty-case handler, and
   a "never invent" rule. (Module 05 is all about why.)
3. **Define real tools in `tools.ts`** — but **fake the actions first**
   (`console.log`). Get the loop working against fakes before you wire any real
   API. This is the single biggest beginner time-saver: get the brain right
   against fake hands, then bolt on real hands.

### Example: swap the faked send for a real Slack send

In `tools.ts`, replace the `console.log` in `send_digest` with:

```typescript
await fetch(process.env.SLACK_WEBHOOK_URL!, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ text: `*${input.subject}*\n${input.body}` }),
});
```

Set `SLACK_WEBHOOK_URL` in `.env` and you have a real morning digest agent.

## Requirements

- Node 20+
- An Anthropic API key — https://console.anthropic.com/settings/keys

## Course

This repo is the hands-on artifact for Module 02 of *AI Agents for Beginners*.
The course teaches the four agent patterns, memory/tools/evals, prompting for
production, cost/latency/security, deployment, and a teardown of 30+ agents
running in production. → https://alejandrorioja.com/course/
