import { useMemo, useState } from 'react'
import './App.css'
import { chapters, levels } from './curriculum'
import { MissionPanel } from './components/mission/MissionPanel'
import { modeLabel } from './components/mission/modeLabel'
import { Sandbox } from './components/sandbox/Sandbox'
import { WorldBoard } from './components/world/WorldBoard'
import { evaluateFormula, type World } from './logic'

type Choice = 'true' | 'false' | null

const storageKey = 'tarski-logic-quest-progress'

function getSavedLevel(): number {
  const raw = window.localStorage.getItem(storageKey)
  const value = raw ? Number.parseInt(raw, 10) : 1
  return Number.isFinite(value) ? Math.min(Math.max(value, 1), levels.length) : 1
}

function formulaTruth(formula: string, world: World): boolean {
  return evaluateFormula(formula, world)
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

  const canCheck = (
    (level.mode === 'judge' && choice !== null) ||
    (level.mode === 'construct' && selectedCandidate !== null) ||
    (level.mode === 'proof' && selectedProofOption !== null)
  )

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

          <MissionPanel
            level={level}
            totalLevels={levels.length}
            choice={choice}
            selectedCandidate={selectedCandidate}
            selectedCandidateTruth={selectedCandidateTruth}
            selectedProofOption={selectedProofOption}
            checked={checked}
            expected={expected}
            isCorrect={isCorrect}
            canCheck={canCheck}
            onChoiceChange={(nextChoice) => {
              setChoice(nextChoice)
              setChecked(false)
            }}
            onCandidateChange={(index) => {
              setSelectedCandidate(index)
              setChecked(false)
            }}
            onProofOptionChange={(index) => {
              setSelectedProofOption(index)
              setChecked(false)
            }}
            onCheckedChange={setChecked}
            onNextLevel={nextLevel}
          />
        </div>

        <Sandbox formula={sandboxFormula} onFormulaChange={setSandboxFormula} world={activeWorld} />
      </section>
    </main>
  )
}

export default App
