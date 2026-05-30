import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { tools, runTool } from './tools';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
const systemPrompt = readFileSync('./src/prompt.md', 'utf-8');

async function main() {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: 'Run your job now.' },
  ];

  // The agent loop: keep going until the model stops asking for tools.
  while (true) {
    const res = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      tools,                       // what the agent is allowed to DO
      messages,
    });

    messages.push({ role: 'assistant', content: res.content });

    // Did the model decide to use a tool?
    const toolUses = res.content.filter((c) => c.type === 'tool_use');
    if (toolUses.length === 0) {
      // No tool requested → the agent is done. Print its final word.
      const text = res.content.find((c) => c.type === 'text');
      console.log(text?.text ?? '(done)');
      break;
    }

    // Run each requested tool, feed results back in, loop again.
    const results = await Promise.all(
      toolUses.map(async (t) => ({
        type: 'tool_result' as const,
        tool_use_id: t.id,
        content: await runTool(t.name, t.input),
      }))
    );
    messages.push({ role: 'user', content: results });
  }
}

main();
