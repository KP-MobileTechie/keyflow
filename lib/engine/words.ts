// 150 common English words, lowercase, letters only.
export const WORDS: string[] = [
  'the','be','to','of','and','a','in','that','have','it','for','not','on','with','he',
  'as','you','do','at','this','but','his','by','from','they','we','say','her','she','or',
  'an','will','my','one','all','would','there','their','what','so','up','out','if','about',
  'who','get','which','go','me','when','make','can','like','time','no','just','him','know',
  'take','people','into','year','your','good','some','could','them','see','other','than',
  'then','now','look','only','come','its','over','think','also','back','after','use','two',
  'how','our','work','first','well','way','even','new','want','because','any','these',
  'give','day','most','us','great','between','need','feel','high','too','place','small',
  'world','very','still','own','last','long','find','here','thing','many','life','both',
  'under','never','same','another','while','keep','might','every','end','turn','few',
  'start','show','hand','large','again','off','play','run','move','live','point','believe',
  'hold','today','bring','happen','next','without','before','around','once',
];

/** Deterministic PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateWords(count: number, seed?: number): string[] {
  const rand = seed === undefined ? Math.random : mulberry32(seed);
  const out: string[] = [];
  let prev = '';
  for (let i = 0; i < count; i++) {
    let idx = Math.floor(rand() * WORDS.length);
    if (WORDS[idx] === prev) idx = (idx + 1) % WORDS.length;
    const w = WORDS[idx];
    out.push(w);
    prev = w;
  }
  return out;
}

export function generateText(count: number, seed?: number): string {
  return generateWords(count, seed).join(' ');
}
