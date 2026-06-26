import type { Level } from '../../curriculum'
import { modeLabel } from './modeLabel'

type Choice = 'true' | 'false' | null

type MissionPanelProps = {
  level: Level
  totalLevels: number
  choice: Choice
  selectedCandidate: number | null
  selectedCandidateTruth: boolean | null
  selectedProofOption: number | null
  checked: boolean
  expected: boolean | null
  isCorrect: boolean
  canCheck: boolean
  onChoiceChange: (choice: Choice) => void
  onCandidateChange: (index: number) => void
  onProofOptionChange: (index: number) => void
  onCheckedChange: (checked: boolean) => void
  onNextLevel: () => void
}

export function MissionPanel({
  level,
  totalLevels,
  choice,
  selectedCandidate,
  selectedCandidateTruth,
  selectedProofOption,
  checked,
  expected,
  isCorrect,
  canCheck,
  onChoiceChange,
  onCandidateChange,
  onProofOptionChange,
  onCheckedChange,
  onNextLevel,
}: MissionPanelProps) {
  return (
    <section className="mission-panel" aria-label="公式任务">
      <div className="panel-heading">
        <h3>{level.mode === 'proof' ? '证明目标' : '公式'}</h3>
        <span>{modeLabel(level)}</span>
      </div>

      <div className="formula-display">{level.formula}</div>

      {level.mode === 'judge' ? (
        <div className="choice-row" role="group" aria-label="选择公式真假">
          <button
            className={choice === 'true' ? 'choice-button selected' : 'choice-button'}
            type="button"
            onClick={() => onChoiceChange('true')}
          >
            真
          </button>
          <button
            className={choice === 'false' ? 'choice-button selected' : 'choice-button'}
            type="button"
            onClick={() => onChoiceChange('false')}
          >
            假
          </button>
        </div>
      ) : null}

      {level.mode === 'construct' ? (
        <div className="candidate-list">
          {level.candidates.map((candidate, index) => (
            <button
              className={selectedCandidate === index ? 'candidate-button selected' : 'candidate-button'}
              key={candidate.label}
              type="button"
              onClick={() => onCandidateChange(index)}
            >
              <strong>{candidate.label}</strong>
              <span>{candidate.note}</span>
            </button>
          ))}
        </div>
      ) : null}

      {level.mode === 'proof' ? (
        <div className="proof-panel">
          <div>
            <span>前提</span>
            {level.premises.length > 0 ? level.premises.map((premise) => <code key={premise}>{premise}</code>) : <code>无前提</code>}
          </div>
          <div>
            <span>结论</span>
            <code>{level.conclusion}</code>
          </div>
          <p>{level.proofQuestion}</p>
          <div className="proof-options">
            {level.proofOptions.map((option, index) => (
              <button
                className={selectedProofOption === index ? 'proof-option selected' : 'proof-option'}
                key={option}
                type="button"
                onClick={() => onProofOptionChange(index)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button className="primary-button" type="button" disabled={!canCheck} onClick={() => onCheckedChange(true)}>
        检查答案
      </button>

      <div className={checked ? (isCorrect ? 'feedback correct' : 'feedback wrong') : 'feedback'}>
        {checked ? (
          <>
            <strong>{isCorrect ? '判断正确' : '还差一步'}</strong>
            <p>
              {level.mode === 'judge' ? `这个公式在当前世界中为 ${expected ? '真' : '假'}。` : null}
              {level.mode === 'construct' && selectedCandidateTruth !== null ? `你选择的世界让公式为 ${selectedCandidateTruth ? '真' : '假'}。` : null}
              {level.explanation}
            </p>
          </>
        ) : (
          <>
            <strong>提示</strong>
            <p>{level.hint}</p>
          </>
        )}
      </div>

      <div className="action-row">
        <button className="ghost-button" type="button" onClick={() => onCheckedChange(true)}>
          显示解释
        </button>
        <button className="primary-button" type="button" disabled={!isCorrect || level.id === totalLevels} onClick={onNextLevel}>
          下一关
        </button>
      </div>
    </section>
  )
}
