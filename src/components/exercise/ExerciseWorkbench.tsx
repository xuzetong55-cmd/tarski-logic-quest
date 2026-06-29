import { useMemo, useState } from 'react'
import {
  LogicError,
  evaluateFormulaAst,
  parseFormula,
  predicateHelp,
  type Formula,
  type World,
  type WorldObject,
} from '../../logic'
import { WorldBoard } from '../world/WorldBoard'

const builderStorageKey = 'tarski-logic-quest-builder-world'

const exerciseWorld: World = {
  width: 5,
  height: 4,
  objects: [
    { id: 'A', shape: 'cube', size: 'small', x: 0, y: 0 },
    { id: 'B', shape: 'cube', size: 'medium', x: 1, y: 1 },
    { id: 'C', shape: 'tet', size: 'small', x: 3, y: 1 },
    { id: 'D', shape: 'dodec', size: 'large', x: 4, y: 2 },
  ],
}

type SentenceResult = {
  input: string
  ok: boolean
  value: boolean
  diagnostic: string
}

type ExercisePreset = {
  title: string
  sentences: string
  world: World
}

const presets: ExercisePreset[] = [
  {
    title: '小立方体存在',
    sentences: '∃x (Cube(x) ∧ Small(x))\n∀x (Cube(x) → ¬Dodec(x))',
    world: exerciseWorld,
  },
  {
    title: '寻找反模型',
    sentences: '∀x (Cube(x) → Small(x))\n∃x Tet(x)',
    world: exerciseWorld,
  },
  {
    title: '关系检查',
    sentences: 'LeftOf(A, D)\nSameRow(A, C)\n∃x RightOf(x, B)',
    world: exerciseWorld,
  },
]

function cloneWorld(world: World): World {
  return {
    width: world.width,
    height: world.height,
    objects: world.objects.map((object) => ({ ...object })),
  }
}

function normalizeWorld(value: unknown): World {
  if (!value || typeof value !== 'object') throw new Error('World must be an object')
  const record = value as Partial<World>
  const width = clampInteger(record.width, 3, 8)
  const height = clampInteger(record.height, 3, 8)
  const occupied = new Set<string>()
  const objects = Array.isArray(record.objects)
    ? record.objects.flatMap((item) => normalizeObject(item, width, height, occupied))
    : []
  return { width, height, objects }
}

function normalizeObject(value: unknown, width: number, height: number, occupied: Set<string>): WorldObject[] {
  if (!value || typeof value !== 'object') return []
  const record = value as Partial<WorldObject>
  const id = typeof record.id === 'string' ? record.id.trim().replace(/[^A-Za-z0-9_]/g, '').slice(0, 12) : ''
  const shape = record.shape === 'cube' || record.shape === 'tet' || record.shape === 'dodec' ? record.shape : 'cube'
  const size = record.size === 'small' || record.size === 'medium' || record.size === 'large' ? record.size : 'medium'
  const x = clampInteger(record.x, 0, width - 1)
  const y = clampInteger(record.y, 0, height - 1)
  const position = `${x},${y}`
  if (!id || occupied.has(position)) return []
  occupied.add(position)
  return [{ id, shape, size, x, y }]
}

function clampInteger(value: unknown, min: number, max: number): number {
  const number = typeof value === 'number' ? value : Number.parseInt(String(value), 10)
  if (!Number.isFinite(number)) return min
  return Math.min(Math.max(Math.trunc(number), min), max)
}

function topLevelQuantifierDiagnostic(formula: Formula, value: boolean, world: World): string | null {
  if (formula.kind !== 'quantifier') return null

  if (formula.quantifier === 'forall') {
    const failing = world.objects.find((object) => !evaluateFormulaAst(formula.body, world, { [formula.variable]: object }))
    if (failing) return `${formula.variable} = ${failing.id} 时失败。`
    return value ? `所有 ${world.objects.length} 个对象都满足。` : null
  }

  const witness = world.objects.find((object) => evaluateFormulaAst(formula.body, world, { [formula.variable]: object }))
  if (witness) return `${formula.variable} = ${witness.id} 是见证对象。`
  return '没有对象能作为存在量词的见证。'
}

function analyzeSentence(input: string, world: World): SentenceResult {
  try {
    const formula = parseFormula(input)
    const value = evaluateFormulaAst(formula, world)
    return {
      input,
      ok: true,
      value,
      diagnostic: topLevelQuantifierDiagnostic(formula, value, world) ?? (value ? '当前世界满足这句话。' : '当前世界给出了反例。'),
    }
  } catch (error) {
    return {
      input,
      ok: false,
      value: false,
      diagnostic: error instanceof LogicError ? error.message : '公式无法解析',
    }
  }
}

function readBuilderWorld(): World | null {
  try {
    const raw = window.localStorage.getItem(builderStorageKey)
    return raw ? normalizeWorld(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function ExerciseWorkbench() {
  const [world, setWorld] = useState(() => cloneWorld(exerciseWorld))
  const [sentences, setSentences] = useState(presets[0].sentences)
  const [jsonDraft, setJsonDraft] = useState(() => JSON.stringify(exerciseWorld, null, 2))
  const [worldMessage, setWorldMessage] = useState('使用内置练习世界')

  const sentenceInputs = useMemo(() => sentences.split('\n').map((line) => line.trim()).filter(Boolean), [sentences])
  const results = useMemo(() => sentenceInputs.map((sentence) => analyzeSentence(sentence, world)), [sentenceInputs, world])
  const parseReady = results.every((result) => result.ok)
  const satisfied = parseReady && results.every((result) => result.value)
  const falseSentences = results.filter((result) => result.ok && !result.value)

  function loadPreset(preset: ExercisePreset): void {
    const nextWorld = cloneWorld(preset.world)
    setWorld(nextWorld)
    setSentences(preset.sentences)
    setJsonDraft(JSON.stringify(nextWorld, null, 2))
    setWorldMessage(`已载入：${preset.title}`)
  }

  function loadBuilderWorld(): void {
    const nextWorld = readBuilderWorld()
    if (!nextWorld) {
      setWorldMessage('没有找到建造器保存的世界。')
      return
    }
    setWorld(nextWorld)
    setJsonDraft(JSON.stringify(nextWorld, null, 2))
    setWorldMessage('已绑定 Tarski 建造器保存的世界。')
  }

  function importWorld(): void {
    try {
      const nextWorld = normalizeWorld(JSON.parse(jsonDraft))
      setWorld(nextWorld)
      setWorldMessage('已载入 JSON 世界。')
    } catch {
      setWorldMessage('JSON 世界格式不正确。')
    }
  }

  return (
    <section className="exercise-workbench">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Tarski Exercise Engine · 0.6.0</p>
          <h2>练习引擎</h2>
        </div>
        <div className="workspace-actions">
          {presets.map((preset) => (
            <button className="ghost-button" key={preset.title} type="button" onClick={() => loadPreset(preset)}>
              {preset.title}
            </button>
          ))}
        </div>
      </header>

      <div className="exercise-grid">
        <section className="surface-panel">
          <div className="panel-heading">
            <h3>当前世界</h3>
            <span>{world.width}×{world.height} · {world.objects.length} 个对象</span>
          </div>
          <WorldBoard world={world} />
        </section>

        <section className="surface-panel exercise-editor">
          <div className="panel-heading">
            <h3>句子集合</h3>
            <span>{sentenceInputs.length} 句话</span>
          </div>
          <label className="exercise-input">
            <span>每行输入一个一阶句子</span>
            <textarea value={sentences} onChange={(event) => setSentences(event.target.value)} spellCheck={false} />
          </label>
          <div className={satisfied ? 'model-summary satisfied' : 'model-summary countermodel'}>
            <strong>{parseReady ? (satisfied ? '当前世界是模型' : '当前世界不是模型') : '存在无法解析的句子'}</strong>
            <span>
              {parseReady
                ? satisfied
                  ? '所有句子都在当前世界中为真。'
                  : `${falseSentences.length} 句话为假，当前世界可作为反模型线索。`
                : '先修正红色行，再判断模型关系。'}
            </span>
          </div>
        </section>
      </div>

      <section className="surface-panel">
        <div className="panel-heading">
          <h3>逐句诊断</h3>
          <span>{parseReady ? '可判定' : '需要修正'}</span>
        </div>
        <div className="sentence-results">
          {results.map((result) => (
            <article className={result.ok ? (result.value ? 'sentence-row true' : 'sentence-row false') : 'sentence-row error'} key={result.input}>
              <code>{result.input}</code>
              <strong>{result.ok ? (result.value ? '真' : '假') : '错误'}</strong>
              <span>{result.diagnostic}</span>
            </article>
          ))}
        </div>
        <div className="predicate-help">
          {predicateHelp.map((item) => <code key={item}>{item}</code>)}
        </div>
      </section>

      <section className="surface-panel world-binding">
        <div className="panel-heading">
          <h3>本地世界绑定</h3>
          <span>{worldMessage}</span>
        </div>
        <textarea value={jsonDraft} onChange={(event) => setJsonDraft(event.target.value)} spellCheck={false} />
        <div className="action-row">
          <button className="ghost-button" type="button" onClick={loadBuilderWorld}>使用建造器世界</button>
          <button className="ghost-button" type="button" onClick={() => setJsonDraft(JSON.stringify(world, null, 2))}>导出当前世界</button>
          <button className="primary-button" type="button" onClick={importWorld}>载入 JSON</button>
        </div>
      </section>
    </section>
  )
}
