import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';

export const tools: Anthropic.Tool[] = [
  {
    name: 'read_source',
    description: "Read today's raw input the agent should summarize. Returns plain text.",
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'send_digest',
    description: 'Send the finished digest to the operator. Call this exactly once when done.',
    input_schema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Short subject line' },
        body: { type: 'string', description: 'The digest, in plain text' },
      },
      required: ['subject', 'body'],
    },
  },
];

export async function runTool(name: string, input: any): Promise<string> {
  switch (name) {
    case 'read_source':
      // Swap this for your real source: a calendar API, an RSS feed, a DB query.
      // To start, just read a local file you drop notes into.
      return readFileSync('./source.txt', 'utf-8');

    case 'send_digest':
      // Start by printing. Swap for real email/Slack once it works on screen.
      console.log(`\n=== ${input.subject} ===\n${input.body}\n`);
      // Real version: await sendSlack(input.subject, input.body);
      return 'Digest sent successfully.';

    default:
      return `Unknown tool: ${name}`;
  }
}
