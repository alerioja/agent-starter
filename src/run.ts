import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { tools, runTool } from './tools';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
const systemPrompt = readFileSync('./src/prompt.md', 'utf-8');

async function main() {
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: 'Run your job now.' }];

  // The agent loop: keep going until the model says it's finished.
  while (true) {
    const res = await client.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      output_config: { effort: 'medium' }, // the depth-vs-cost dial (Module 05)
      cache_control: { type: 'ephemeral' }, // cache the repeated prefix (Module 06)
      system: systemPrompt,
      tools, // what the agent is allowed to DO
      messages,
    });

    // Keep the model's whole turn in the history: text, thinking and tool calls.
    messages.push({ role: 'assistant', content: res.content });

    // Always check WHY the model stopped before you read what it said.
    switch (res.stop_reason) {
      case 'tool_use': {
        // Run every tool it asked for, then send ALL the results back in ONE message.
        const toolUses = res.content.filter((c) => c.type === 'tool_use');
        const results = await Promise.all(
          toolUses.map(async (t): Promise<Anthropic.ToolResultBlockParam> => {
            try {
              return {
                type: 'tool_result',
                tool_use_id: t.id,
                content: await runTool(t.name, t.input),
              };
            } catch (err) {
              // A failed tool is a message to the model, not a crash.
              return {
                type: 'tool_result',
                tool_use_id: t.id,
                content: String(err),
                is_error: true,
              };
            }
          }),
        );
        messages.push({ role: 'user', content: results });
        continue;
      }

      case 'pause_turn':
        // A long server-side step paused. Sending the turn back resumes it.
        continue;

      case 'end_turn': {
        // Done. Print its final word.
        const text = res.content.find((c) => c.type === 'text');
        console.log(text?.text ?? '(done)');
        return;
      }

      case 'max_tokens':
        throw new Error('Ran out of max_tokens mid-answer. Raise it, or stream (Module 07).');

      case 'refusal':
        throw new Error(
          `The model declined this run (category: ${res.stop_details?.category ?? 'none'}).`,
        );

      default:
        throw new Error(`Unexpected stop_reason: ${res.stop_reason}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1); // fail loudly, so a scheduler marks the run red
});
