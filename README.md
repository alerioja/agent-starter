# agent-starter

The minimal production **agent loop** from _AI Agents for Beginners_ — Module 02.
Copy this repo, run it once, and you'll have a working agent that triggers,
reads a source, decides what matters, takes an action, and stops.

> Three files matter:
>
> - `src/run.ts` — **the loop.** The engine. Copy it forever, rarely edit it.
> - `src/prompt.md` — **the agent's job description.** You own this.
> - `src/tools.ts` — **the things the agent can DO.** You add to this.
>
> The loop is boilerplate, the prompt is the product, the tools are the leverage.

`src/run-with-runner.ts` is the same agent with the SDK's Tool Runner running
the loop for you, so you can compare the two.

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
npm start              # = tsx --env-file=.env src/run.ts
npm run start:runner   # the same agent on the SDK's Tool Runner
npm run typecheck      # tsc --noEmit
```

You'll watch the agent call `read_source`, think, then call `send_digest`
and print a digest built from `source.txt`. That's a complete agent.

## How it works

`src/run.ts` is the whole loop (about 70 lines):

1. **Trigger** — you run the file.
2. **Context + decide** — the model (`claude-opus-5-5`, at `medium` effort) reads `prompt.md` and the conversation.
3. **Act** — it calls tools from `tools.ts`. Every result goes back in one message; a tool that throws is returned with `is_error: true` instead of crashing the run.
4. **Check** — the loop reads `stop_reason` before anything else: `tool_use` runs tools and loops, `end_turn` prints the final word, and `max_tokens` or `refusal` fail the run loudly (exit code 1).
5. **Repeat** — until the model says it's finished.

The tools use `strict: true` with `additionalProperties: false`, so the API
guarantees their inputs match the schema. `cache_control` caches the prefix
that repeats on every turn.

Everything else in the course is a more sophisticated version of these lines.

## Make it yours

1. **Keep `run.ts` as-is.** The loop rarely changes.
2. **Rewrite `prompt.md`** for your job. Keep the four production clauses:
   "you run unattended," an explicit "done means," an empty-case handler, and
   a "never invent" rule with its reason. (Module 05 is all about why.)
3. **Define real tools in `tools.ts`** — but **fake the actions first**
   (`console.log`). Get the loop working against fakes before you wire any real
   API. This is the single biggest beginner time-saver: get the brain right
   against fake hands, then bolt on real hands.

### Example: swap the faked send for a real Slack send

In `tools.ts`, replace the `send_digest` case with:

```typescript
case 'send_digest': {
  const { subject, body } = input as { subject: string; body: string };
  const res = await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: `*${subject}*\n${body}` }),
  });
  if (!res.ok) throw new Error(`Slack returned ${res.status}`);
  return 'Posted to Slack.';
}
```

Set `SLACK_WEBHOOK_URL` in `.env` and you have a real morning digest agent.

## Requirements

- Node 22+
- An Anthropic API key — https://platform.claude.com/settings/keys
- `@anthropic-ai/sdk` 1.14 or later (installed by `npm install`)

## Course

This repo is the hands-on artifact for Module 02 of _AI Agents for Beginners_.
The course teaches the four agent patterns, memory/tools/evals, prompting for
production, cost/latency/security, deployment, and a teardown of 30+ agents
running in production. → https://alejandrorioja.com/course/
