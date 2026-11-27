import Anthropic from '@anthropic-ai/sdk';
import { betaZodTool } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import { readFileSync } from 'fs';

const client = new Anthropic();
const systemPrompt = readFileSync('./src/prompt.md', 'utf-8');

// Same two tools as tools.ts, but each one carries its own `run` function.
const readSource = betaZodTool({
  name: 'read_source',
  description:
    "Read today's raw input the agent should summarize. Returns plain text, which may be empty.",
  inputSchema: z.object({}),
  run: async () => readFileSync('./source.txt', 'utf-8'),
});

const sendDigest = betaZodTool({
  name: 'send_digest',
  description:
    'Send the finished digest to the operator. Call it once, after the digest is written.',
  inputSchema: z.object({
    subject: z.string().describe('Short subject line'),
    body: z.string().describe('The digest, in plain text'),
  }),
  run: async ({ subject, body }) => {
    console.log(`\n=== ${subject} ===\n${body}\n`);
    return 'Digest sent successfully.';
  },
});

async function main() {
  // The SDK runs the loop: call the model, run tools, send results, repeat.
  const final = await client.beta.messages.toolRunner({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    max_iterations: 10, // the loop cap from Module 06, built in
    output_config: { effort: 'medium' },
    system: systemPrompt,
    tools: [readSource, sendDigest],
    messages: [{ role: 'user', content: 'Run your job now.' }],
  });

  // You still check why it stopped.
  if (final.stop_reason !== 'end_turn') {
    throw new Error(`Run ended early: ${final.stop_reason}`);
  }
  const text = final.content.find((c) => c.type === 'text');
  console.log(text?.text ?? '(done)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
