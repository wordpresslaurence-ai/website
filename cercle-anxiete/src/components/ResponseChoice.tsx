import type { Choice } from '../types';
import { CATEGORY_META } from '../types';

interface Props {
  choice: Choice;
  letter: string; // A / B / C
  selected: boolean;
  onSelect: () => void;
}

export function ResponseChoice({ choice, letter, selected, onSelect }: Props) {
  const meta = CATEGORY_META[choice.category];
  return (
    <button
      type="button"
      className="choice"
      aria-pressed={selected}
      onClick={onSelect}
      style={{ ['--choice-color' as string]: meta.colorVar }}
    >
      <span className="choice-marker" aria-hidden="true">
        {letter}
      </span>
      <span className="choice-body">
        <span className="choice-kind">{meta.kind}</span>
        <span className="choice-text">{choice.text}</span>
      </span>
    </button>
  );
}
