import { describe, it, expect } from 'vitest';
import { createTracker, handleChar, handleBackspace, isComplete } from '@/lib/engine/tracker';

describe('tracker', () => {
  it('starts pending with position 0', () => {
    const s = createTracker('abc');
    expect(s.position).toBe(0);
    expect(s.charStates).toEqual(['pending', 'pending', 'pending']);
    expect(s.keystrokes).toHaveLength(0);
  });

  it('marks correct chars and advances', () => {
    let s = createTracker('ab');
    s = handleChar(s, 'a', 1000);
    expect(s.charStates[0]).toBe('correct');
    expect(s.position).toBe(1);
    expect(s.keystrokes[0]).toMatchObject({ type: 'char', key: 'a', expected: 'a', correct: true });
  });

  it('marks wrong chars and still advances', () => {
    let s = createTracker('ab');
    s = handleChar(s, 'x', 1000);
    expect(s.charStates[0]).toBe('wrong');
    expect(s.position).toBe(1);
    expect(s.keystrokes[0].correct).toBe(false);
  });

  it('backspace rewinds char state but keeps the log', () => {
    let s = createTracker('ab');
    s = handleChar(s, 'x', 1000);
    s = handleBackspace(s, 1100);
    expect(s.position).toBe(0);
    expect(s.charStates[0]).toBe('pending');
    expect(s.keystrokes).toHaveLength(2);
    expect(s.keystrokes[1].type).toBe('backspace');
  });

  it('backspace at position 0 is a no-op', () => {
    const s = createTracker('ab');
    expect(handleBackspace(s, 1000)).toBe(s);
  });

  it('ignores input past the end and reports completion', () => {
    let s = createTracker('a');
    s = handleChar(s, 'a', 1000);
    expect(isComplete(s)).toBe(true);
    expect(handleChar(s, 'b', 1100)).toBe(s);
  });

  it('does not mutate previous state (immutability)', () => {
    const s0 = createTracker('ab');
    handleChar(s0, 'a', 1000);
    expect(s0.position).toBe(0);
    expect(s0.charStates[0]).toBe('pending');
  });
});
