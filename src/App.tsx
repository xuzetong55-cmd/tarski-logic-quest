import { useMemo, useState } from 'react'
import './App.css'
import { chapters, levels, type Level } from './levels'
import { describeObject, evaluateFormula, LogicError, predicateHelp, type World, type WorldObject } from './logic'

type Choice = 'true' | 'false' | null

const storageKey = 'tarski-logic-quest-progress'

function getSavedLevel(): number {
  const raw = window.localStorage.getItem(storageKey)
  const value = raw ? Number.parseInt(raw, 10) : 1
  return Number.isFinite(value) ? Math.min(Math.max(value, 1), levels.length) : 1
}

function shapeGlyph(object: WorldObject): string {
  if (object.shape === 'cube') return '□'
  if (object.shape === 'tet') return '△'
  return '⬡'
}

function shapeName(object: WorldObject): string {
  if (object.shape === 'cube') return 'Cube'
  if (object.shape === 'tet') return 'Tet'
  return 'Dodec'
}

function sizeClass(object: WorldObject): string {
  return `piece ${object.shape} ${object.size}`
}

function modeLabel(level: Level): string {
  if (level.mode === 'construct') return '构造模型'
  if (level.mode === 'proof') return '证明训练'
  return '判断真假'
}

function formulaTruth(formula: string, world: World): boolean {
  return evaluateFormula(formula, world)
}

function WorldBoard({ world }: { world: World }) {
  return (
    <>
      <div
        className="board"
        style={{
          gridTemplateColumns: `repeat(${world.width}, minmax(54px, 1fr))`,
          gridTemplateRows: `repeat(${world.height}, minmax(54px, 1fr))`,
        }}
      >
        {Array.from({ length: world.width * world.height }).map((_, index) => {
          const x = index % world.width
          const y = Math.floor(index / world.width)
          const object = world.objects.find((item) => item.x === x && item.y === y)

          return (
            <div className="cell" key={`${x}-${y}`}>
              <span className="coord">{x},{y}</span>
              {object ? (
                <div className={sizeClass(object)} title={describeObject(object)}>
                  <span className="piece-id">{object.id}</span>
                  <span className="piece-shape">{shapeGlyph(object)}</span>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="object-list">
        {world.objects.map((object) => (
          <div className="object-row" key={object.id}>
            <span className={sizeClass(object)}>{shapeGlyph(object)}</span>
            <div>
              <strong>{object.id}</strong>
              <small>{shapeName(object)} · {object.size} · ({object.x}, {object.y})</small>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function App() {
  const [levelNumber, setLevelNumber] = useState(getSavedLevel)
  const [choice, setChoice] = useState<Choice>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null)
  const [selectedProofOption, setSelectedProofOption] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [sandboxFormula, setSandboxFormula] = useState('∃x Cube(x)')

  const level = levels[levelNumber - 1]
  const activeWorld = level.mode === 'construct' && selectedCandidate !== null
    ? level.candidates[selectedCandidate].world
    : level.world

  const expected = useMemo(() => {
    if (level.mode !== 'judge') return null
    return formulaTruth(level.formula, level.world)
  }, [level])

  const selectedCandidateTruth = useMemo(() => {
    if (level.mode !== 'construct' || selectedCandidate === null) return null
    return formulaTruth(level.formula, level.candidates[selectedCandidate].world)
  }, [level, selectedCandidate])

  const isCorrect = checked && (
    (level.mode === 'judge' && choice !== null && (choice === 'true') === expected) ||
    (level.mode === 'construct' && selectedCandidateTruth === level.targetTruth) ||
    (level.mode === 'proof' && selectedProofOption === level.correctOption)
  )

  const sandboxResult = useMemo(() => {
    try {
      return { ok: true, value: evaluateFormula(sandboxFormula, activeWorld) }
    } catch (error) {
      return { ok: false, value: error instanceof LogicError ? error.message : '公式无法解析' }
    }
  }, [activeWorld, sandboxFormula])

  function resetInteraction(): void {
    setChoice(null)
    setSelectedCandidate(null)
    setSelectedProofOption(null)
    setChecked(false)
  }

  function selectLevel(next: number): void {
    setLevelNumber(next)
    resetInteraction()
    window.localStorage.setItem(storageKey, String(next))
  }

  function nextLevel(): void {
    selectLevel(Math.min(levelNumber + 1, levels.length))
  }

  const progress = Math.round((levelNumber / levels.length) * 100)
  const canCheck = (
    (level.mode === 'judge' && choice !== null) ||
    (level.mode === 'construct' && selectedCandidate !== null) ||
    (level.mode === 'proof' && selectedProofOption !== null)
  )

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="课程关卡">
        <div className="brand-block">
          <p className="eyebrow">Tarski Logic Quest</p>
          <h1>一阶逻辑训练场</h1>
        </div>

        <div className="progress-block">
          <div className="progress-copy">
            <span>学习进度</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track" aria-hidden="true">
            <div style={{ width: `${progress}%` }} />
          </div>
        </div>

        <nav className="chapter-list" aria-label="章节">
          {chapters.map((chapter) => (
            <section className="chapter-group" key={chapter.title}>
              <h2>{chapter.title}</h2>
              <div className="level-list">
                {chapter.levels.map((item) => (
                  <button
                    className={item.id === level.id ? 'level-button active' : 'level-button'}
                    key={item.id}
                    type="button"
                    onClick={() => selectLevel(item.id)}
                  >
                    <span>{String(item.id).padStart(2, '0')}</span>
                    <strong>{item.title}</strong>
                    <small>{modeLabel(item)} · {item.topic}</small>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">第 {level.id} 关 / {levels.length} · {modeLabel(level)}</p>
            <h2>{level.title}</h2>
          </div>
          <button className="ghost-button" type="button" onClick={() => selectLevel(1)}>
            重置到第 1 关
          </button>
        </header>

        <section className="lesson-band">
          <div>
            <p className="eyebrow">{level.chapter}</p>
            <p>{level.lesson}</p>
          </div>
          <div className="goal-box">
            <span>任务</span>
            <strong>{level.goal}</strong>
          </div>
        </section>

        <div className="study-grid">
          <section className="world-panel" aria-label="Tarski 世界">
            <div className="panel-heading">
              <h3>{level.mode === 'construct' ? '当前候选世界' : '世界'}</h3>
              <span>{activeWorld.objects.length} 个对象</span>
            </div>
            <WorldBoard world={activeWorld} />
          </section>

          <section className="mission-panel" aria-label="公式任务">
            <div className="panel-heading">
              <h3>{level.mode === 'proof' ? '证明目标' : '公式'}</h3>
              <span>{modeLabel(level)}</span>
            </div>

            <div className="formula-display">{level.formula}</div>

            {level.mode === 'judge' ? (
              <>
                <div className="choice-row" role="group" aria-label="选择公式真假">
                  <button
                    className={choice === 'true' ? 'choice-button selected' : 'choice-button'}
                    type="button"
                    onClick={() => {
                      setChoice('true')
                      setChecked(false)
                    }}
                  >
                    真
                  </button>
                  <button
                    className={choice === 'false' ? 'choice-button selected' : 'choice-button'}
                    type="button"
                    onClick={() => {
                      setChoice('false')
                      setChecked(false)
                    }}
                  >
                    假
                  </button>
                </div>
              </>
            ) : null}

            {level.mode === 'construct' ? (
              <div className="candidate-list">
                {level.candidates.map((candidate, index) => (
                  <button
                    className={selectedCandidate === index ? 'candidate-button selected' : 'candidate-button'}
                    key={candidate.label}
                    type="button"
                    onClick={() => {
                      setSelectedCandidate(index)
                      setChecked(false)
                    }}
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
                      onClick={() => {
                        setSelectedProofOption(index)
                        setChecked(false)
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <button className="primary-button" type="button" disabled={!canCheck} onClick={() => setChecked(true)}>
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
              <button className="ghost-button" type="button" onClick={() => setChecked(true)}>
                显示解释
              </button>
              <button className="primary-button" type="button" disabled={!isCorrect || level.id === levels.length} onClick={nextLevel}>
                下一关
              </button>
            </div>
          </section>
        </div>

        <section className="sandbox">
          <div className="panel-heading">
            <h3>自由实验</h3>
            <span>使用当前显示的世界</span>
          </div>
          <div className="sandbox-grid">
            <label>
              <span>输入公式</span>
              <input
                value={sandboxFormula}
                onChange={(event) => setSandboxFormula(event.target.value)}
                spellCheck={false}
              />
            </label>
            <div className={sandboxResult.ok ? 'sandbox-result' : 'sandbox-result error'}>
              {sandboxResult.ok ? `结果：${sandboxResult.value ? '真' : '假'}` : sandboxResult.value}
            </div>
          </div>
          <div className="symbol-bank">
            {['¬', '∧', '∨', '→', '∀x', '∃x', '(', ')', '='].map((symbol) => (
              <button
                type="button"
                key={symbol}
                onClick={() => setSandboxFormula((value) => `${value} ${symbol}`.trim())}
              >
                {symbol}
              </button>
            ))}
          </div>
          <div className="predicate-help">
            {predicateHelp.map((item) => (
              <code key={item}>{item}</code>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
