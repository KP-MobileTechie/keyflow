export type CharState = 'pending' | 'correct' | 'wrong';

/**
 * One entry in the append-only keystroke log.
 *
 * Convention: backspace entries always carry `key: ''` and `correct: false`
 * and are NOT typing attempts — consumers computing accuracy/WPM must filter
 * on `type === 'char'` (see lib/engine/stats.ts).
 */
export interface Keystroke {
  type: 'char' | 'backspace';
  key: string;        // typed char ('' for backspace)
  expected: string;   // expected char at that position
  correct: boolean;
  timestamp: number;  // ms epoch
}

export interface TrackerState {
  text: string;
  position: number;
  charStates: CharState[];
  keystrokes: Keystroke[];
}

export function createTracker(text: string): TrackerState {
  return {
    text,
    position: 0,
    charStates: Array<CharState>(text.length).fill('pending'),
    keystrokes: [],
  };
}

export function handleChar(state: TrackerState, char: string, timestamp: number): TrackerState {
  if (state.position >= state.text.length) return state;
  const expected = state.text[state.position];
  const correct = char === expected;
  const charStates = [...state.charStates];
  charStates[state.position] = correct ? 'correct' : 'wrong';
  return {
    ...state,
    position: state.position + 1,
    charStates,
    keystrokes: [...state.keystrokes, { type: 'char', key: char, expected, correct, timestamp }],
  };
}

export function handleBackspace(state: TrackerState, timestamp: number): TrackerState {
  if (state.position === 0) return state;
  const position = state.position - 1;
  const charStates = [...state.charStates];
  charStates[position] = 'pending';
  return {
    ...state,
    position,
    charStates,
    keystrokes: [
      ...state.keystrokes,
      { type: 'backspace', key: '', expected: state.text[position], correct: false, timestamp },
    ],
  };
}

export function isComplete(state: TrackerState): boolean {
  return state.position >= state.text.length;
}
