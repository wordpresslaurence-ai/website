import type { Choice } from '../types';
import { CATEGORY_META } from '../types';

interface Props {
  choice: Choice;
}

export function EducationalFeedback({ choice }: Props) {
  const meta = CATEGORY_META[choice.category];
  return (
    <div
      className="feedback fade-in"
      style={{ ['--feedback-color' as string]: meta.colorVar }}
      aria-live="polite"
    >
      <p className="feedback-title">Ta réaction ressemble à</p>
      <span className="feedback-tag">{meta.label}</span>
      <dl>
        <dt>À court terme</dt>
        <dd>{choice.feedback.shortTerm}</dd>
        <dt>Ce que ton cerveau pourrait apprendre</dt>
        <dd>{choice.feedback.brainLearning}</dd>
        <dt>Une nuance importante</dt>
        <dd>{choice.feedback.nuance}</dd>
      </dl>
    </div>
  );
}
