import { expect, it, vi } from 'vitest';
import atlasData from '../../public/models/atlas.json';
import type { Atlas } from '../../app/anatomy';
import { assistantConcepts, anatomicalName } from '../../app/atlas-index.mjs';
import { resolveConcept, CORE_CONCEPTS } from '../../app/content';
import { MODEL_TRAINING_QUESTIONS } from '../../app/model-training';
import { askAssistant } from '../../app/assistant';

const atlas = atlasData as unknown as Atlas;

it('resolves all training IDs and preserves untranslated names', () => {
  for (const question of MODEL_TRAINING_QUESTIONS) {
    expect(anatomicalName(question.atlasName)).toBe(question.zhName);
    expect(resolveConcept(atlas, question.conceptId)?.id).toBe(question.conceptId);
  }
  expect(anatomicalName('Unlisted English name')).toBe('Unlisted English name');
  expect(resolveConcept(atlas, '第九胸椎')?.en).toBe('ninth thoracic vertebra');
});

it('retrieves core IDs and a matching concept beyond the old cutoff', () => {
  const entries = assistantConcepts(atlas.concepts,'定位第九胸椎');
  for (const entry of CORE_CONCEPTS) expect(entries.some(c=>c.id===entry.id)).toBe(true);
  expect(entries.some(c=>c.name==='ninth thoracic vertebra')).toBe(true);
});

it('sends follow-up context, retains citations and blocks unrelated follow-ups', async () => {
  const config = {provider:'custom',model:'test',apiKey:'test',baseUrl:'https://example.test'};
  const history = [{question:'比较左右心室',answer:'两者位于心脏。'}];
  const source = {title:'教材',url:'https://example.test/book'};
  const fetcher = vi.fn(async () => Response.json({choices:[{message:{content:JSON.stringify({
    answer:'可以比较两者的心室壁。', actions:[],citations:[source]
  })}}]}));
  vi.stubGlobal('fetch',fetcher);
  try {
    const reply = await askAssistant('它们有什么区别？',config,atlas,history);
    expect(reply.citations).toEqual([source]);
    const calls = fetcher.mock.calls as unknown as [string,RequestInit][];
    expect(JSON.parse(String(calls[0][1].body)).messages.slice(-3).map((m:{content:string})=>m.content))
      .toEqual([history[0].question,history[0].answer,'它们有什么区别？']);
    await askAssistant('请推荐股票',config,atlas,history);
    expect(fetcher).toHaveBeenCalledTimes(1);
  } finally { vi.unstubAllGlobals(); }
});
