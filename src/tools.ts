import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';

export const tools: Anthropic.Tool[] = [
  {
    name: 'read_source',
    description:
      "Read today's raw input the agent should summarize. Returns plain text, which may be empty.",
    strict: true, // the API guarantees the model's input matches the schema
    input_schema: { type: 'object', properties: {}, required: [], additionalProperties: false },
  },
  {
    name: 'send_digest',
    description:
      'Send the finished digest to the operator. Call it once, after the digest is written.',
    strict: true,
    input_schema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Short subject line' },
        body: { type: 'string', description: 'The digest, in plain text' },
      },
      required: ['subject', 'body'],
      additionalProperties: false,
    },
  },
];

// Return a string the model will read. Throw when something fails: run.ts
// turns the error into a tool_result with is_error: true so the model can adapt.
export async function runTool(name: string, input: unknown): Promise<string> {
  switch (name) {
    case 'read_source':
      // Swap this for your real source: a calendar API, an RSS feed, a DB query.
      // To start, just read a local file you drop notes into.
      return readFileSync('./source.txt', 'utf-8');

    case 'send_digest': {
      const { subject, body } = input as { subject: string; body: string }; // strict: true guarantees this shape
      // Start by printing. Swap for real email/Slack once it works on screen.
      console.log(`\n=== ${subject} ===\n${body}\n`);
      return 'Digest sent successfully.';
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
