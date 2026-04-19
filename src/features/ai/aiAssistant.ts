
// Placeholder AI assistant. In production, swap for a real fetch() call.

export type AIModel = {
  id: string;
  name: string;
  vendor: string;
};

export const AI_MODELS: AIModel[] = [
  { id: 'gpt-4o', name: 'GPT-4o', vendor: 'OpenAI' },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', vendor: 'OpenAI' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', vendor: 'Anthropic' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', vendor: 'Anthropic' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', vendor: 'Google' },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', vendor: 'Meta' },
];

const OPENERS = [
  'Tightened, with the measured voice of a long-term investor:',
  'Cleaned up grammar and aligned the argument for a thesis file:',
  'Refined for the quiet conviction of a quarterly letter:',
  'Edited for rhythm, precision, and the restraint professionals respect:',
];

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(' ')
    .map((w) => (w.length > 3 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function polishSentence(s: string): string {
  let t = s.trim();
  if (!t) return t;
  t = t.replace(/\s+/g, ' ');
  t = t.replace(/\bi\b/g, 'I');
  t = t.replace(/\bdont\b/gi, "don't");
  t = t.replace(/\bcant\b/gi, "can't");
  t = t.replace(/\bwont\b/gi, "won't");
  t = t.replace(/\bim\b/gi, "I'm");
  t = t.replace(/\bive\b/gi, "I've");
  t = t.replace(/\bthats\b/gi, "that's");
  t = t[0].toUpperCase() + t.slice(1);
  if (!/[.!?]$/.test(t)) t += '.';
  return t;
}

function rewriteParagraph(p: string): string {
  const sentences = p.split(/(?<=[.!?])\s+/).filter(Boolean).map(polishSentence);
  return sentences.join(' ');
}

function injectVoice(text: string, seed: number): string {
  const flourishes = [
    'The position, patiently held, compounds.',
    'Markets reward preparation, not prediction.',
    'Capital follows clarity.',
    'The asymmetry here is worth sitting with.',
    'Time, as always, is the arbiter.',
  ];
  const pick = flourishes[seed % flourishes.length];
  return `${text}\n\n${pick}`;
}

export async function runAIAssistant(opts: {
  text: string;
  model: string;
  instruction?: string;
  context?: string;
}): Promise<string> {
  const { text, model, instruction, context } = opts;
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 700));

  if (!text.trim()) {
    return '(Nothing to refine yet — jot down a thought and I will align it.)';
  }

  const paragraphs = text.split(/\n\s*\n/).map(rewriteParagraph);
  const body = paragraphs.join('\n\n');

  const seed = (model.length + (instruction?.length || 0) + text.length) % 97;
  const opener = OPENERS[seed % OPENERS.length];
  const modelTag = `[${model}]`;

  let result = `${opener}\n\n${body}`;
  if (instruction && instruction.trim()) {
    result = `${opener}\n\nGuidance: "${instruction.trim()}"\n\n${body}`;
  }
  if (context) {
    result = `${result}`;
  }
  result = injectVoice(result, seed);
  return `${result}\n\n— refined by ${modelTag}`;
}

export function proposeTitle(text: string): string {
  const first = text.split(/[.\n]/)[0]?.trim() || '';
  if (!first) return 'Untitled Thesis';
  const words = first.split(/\s+/).slice(0, 8).join(' ');
  return titleCase(words);
}
