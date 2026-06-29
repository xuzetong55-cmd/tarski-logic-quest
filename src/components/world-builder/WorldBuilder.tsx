import { useEffect, useMemo, useState } from 'react'
import {
  LogicError,
  evaluateFormula,
  predicateHelp,
  type Shape,
  type Size,
  type World,
  type WorldObject,
} from '../../logic'
import { describeObject } from '../../logic'
import { shapeGlyph, shapeName, sizeClass } from '../world/worldDisplay'

const builderStorageKey = 'tarski-logic-quest-builder-world'
const shapeOptions: Shape[] = ['cube', 'tet', 'dodec']
const sizeOptions: Size[] = ['small', 'medium', 'large']

const starterBuilderWorld: World = {
  width: 5,
  height: 5,
  objects: [
    { id: 'A', shape: 'cube', size: 'small', x: 0, y: 0 },
    { id: 'B', shape: 'tet', size: 'medium', x: 2, y: 2 },
    { id: 'C', shape: 'dodec', size: 'large', x: 4, y: 4 },
  ],
}

function cloneWorld(world: World): World {
  return {
    width: world.width,
    height: world.height,
    objects: world.objects.map((object) => ({ ...object })),
  }
}

function readSavedWorld(): World {
  try {
    const raw = window.localStorage.getItem(builderStorageKey)
    if (!raw) return cloneWorld(starterBuilderWorld)
    return normalizeWorld(JSON.parse(raw))
  } catch {
    return cloneWorld(starterBuilderWorld)
  }
}

function normalizeWorld(value: unknown): World {
  if (!value || typeof value !== 'object') {
    throw new Error('World must be an object')
  }

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
  const id = typeof record.id === 'string' ? sanitizeId(record.id) : ''
  const shape = record.shape && shapeOptions.includes(record.shape) ? record.shape : 'cube'
  const size = record.size && sizeOptions.includes(record.size) ? record.size : 'medium'
  const x = clampInteger(record.x, 0, width - 1)
  const y = clampInteger(record.y, 0, height - 1)
  const positionKey = `${x},${y}`
  if (!id || occupied.has(positionKey)) return []
  occupied.add(positionKey)
  return [{ id, shape, size, x, y }]
}

function clampInteger(value: unknown, min: number, max: number): number {
  const number = typeof value === 'number' ? value : Number.parseInt(String(value), 10)
  if (!Number.isFinite(number)) return min
  return Math.min(Math.max(Math.trunc(number), min), max)
}

function sanitizeId(value: string): string {
  return value.trim().replace(/[^A-Za-z0-9_]/g, '').slice(0, 12)
}

function nextObjectId(objects: WorldObject[]): string {
  const used = new Set(objects.map((object) => object.id))
  for (let index = 0; index < 26; index += 1) {
    const id = String.fromCharCode(65 + index)
    if (!used.has(id)) return id
  }
  let index = 1
  while (used.has(`O${index}`)) index += 1
  return `O${index}`
}

function firstEmptyCell(world: World): { x: number; y: number } | null {
  for (let y = 0; y < world.height; y += 1) {
    for (let x = 0; x < world.width; x += 1) {
      if (!world.objects.some((object) => object.x === x && object.y === y)) return { x, y }
    }
  }
  return null
}

function shapeLabel(shape: Shape): string {
  return { cube: 'Cube', tet: 'Tet', dodec: 'Dodec' }[shape]
}

function sizeLabel(size: Size): string {
  return { small: 'Small', medium: 'Medium', large: 'Large' }[size]
}

export function WorldBuilder() {
  const [world, setWorld] = useState(readSavedWorld)
  const [selectedId, setSelectedId] = useState(() => readSavedWorld().objects[0]?.id ?? null)
  const [formula, setFormula] = useState('∃x Cube(x) ∧ ∃y Tet(y)')
  const [jsonDraft, setJsonDraft] = useState(() => JSON.stringify(readSavedWorld(), null, 2))
  const [importMessage, setImportMessage] = useState('')

  const selectedObject = world.objects.find((object) => object.id === selectedId) ?? null
  const formulaResult = useMemo(() => {
    try {
      return { ok: true as const, value: evaluateFormula(formula, world) }
    } catch (error) {
      return { ok: false as const, value: error instanceof LogicError ? error.message : '公式无法解析' }
    }
  }, [formula, world])

  useEffect(() => {
    window.localStorage.setItem(builderStorageKey, JSON.stringify(world))
    setJsonDraft(JSON.stringify(world, null, 2))
  }, [world])

  function addObject(): void {
    const cell = firstEmptyCell(world)
    if (!cell) return
    const object: WorldObject = {
      id: nextObjectId(world.objects),
      shape: 'cube',
      size: 'medium',
      x: cell.x,
      y: cell.y,
    }
    setWorld({ ...world, objects: [...world.objects, object] })
    setSelectedId(object.id)
  }

  function removeSelected(): void {
    if (!selectedObject) return
    const nextObjects = world.objects.filter((object) => object.id !== selectedObject.id)
    setWorld({ ...world, objects: nextObjects })
    setSelectedId(nextObjects[0]?.id ?? null)
  }

  function updateSelected(patch: Partial<WorldObject>): void {
    if (!selectedObject) return
    setWorld({
      ...world,
      objects: world.objects.map((object) => object.id === selectedObject.id ? { ...object, ...patch } : object),
    })
  }

  function renameSelected(value: string): void {
    const nextId = sanitizeId(value)
    if (!selectedObject || !nextId || world.objects.some((object) => object.id === nextId && object.id !== selectedObject.id)) return
    updateSelected({ id: nextId })
    setSelectedId(nextId)
  }

  function moveSelected(x: number, y: number): void {
    if (!selectedObject) return
    const occupant = world.objects.find((object) => object.x === x && object.y === y)
    if (occupant && occupant.id !== selectedObject.id) {
      setSelectedId(occupant.id)
      return
    }
    updateSelected({ x, y })
  }

  function resizeWorld(width: number, height: number): void {
    const nextWidth = clampInteger(width, 3, 8)
    const nextHeight = clampInteger(height, 3, 8)
    const nextObjects = world.objects.map((object) => ({
      ...object,
      x: Math.min(object.x, nextWidth - 1),
      y: Math.min(object.y, nextHeight - 1),
    }))
    const occupied = new Set<string>()
    const uniqueObjects = nextObjects.filter((object) => {
      const key = `${object.x},${object.y}`
      if (occupied.has(key)) return false
      occupied.add(key)
      return true
    })
    setWorld({ width: nextWidth, height: nextHeight, objects: uniqueObjects })
    if (selectedId && !uniqueObjects.some((object) => object.id === selectedId)) {
      setSelectedId(uniqueObjects[0]?.id ?? null)
    }
  }

  function resetWorld(): void {
    const nextWorld = cloneWorld(starterBuilderWorld)
    setWorld(nextWorld)
    setSelectedId(nextWorld.objects[0]?.id ?? null)
    setImportMessage('')
  }

  function importWorld(): void {
    try {
      const nextWorld = normalizeWorld(JSON.parse(jsonDraft))
      setWorld(nextWorld)
      setSelectedId(nextWorld.objects[0]?.id ?? null)
      setImportMessage('已载入 JSON 世界。')
    } catch {
      setImportMessage('JSON 世界格式不正确。')
    }
  }

  return (
    <section className="builder-workbench">
      <header className="builder-header workspace-header">
        <div>
          <p className="eyebrow">Tarski Builder · 0.6.0</p>
          <h2>世界建造器</h2>
        </div>
        <div className="builder-actions workspace-actions">
          <button className="ghost-button" type="button" onClick={resetWorld}>重置世界</button>
          <button className="primary-button compact" type="button" onClick={addObject} disabled={!firstEmptyCell(world)}>添加对象</button>
        </div>
      </header>

      <div className="builder-grid">
        <section className="builder-board-panel" aria-label="可编辑 Tarski 世界">
          <div className="panel-heading">
            <h3>棋盘</h3>
            <span>{world.width}×{world.height} · {world.objects.length} 个对象</span>
          </div>
          <div className="board-size-controls" role="group" aria-label="棋盘尺寸">
            <label>
              <span>宽</span>
              <input type="number" min="3" max="8" value={world.width} onChange={(event) => resizeWorld(Number(event.target.value), world.height)} />
            </label>
            <label>
              <span>高</span>
              <input type="number" min="3" max="8" value={world.height} onChange={(event) => resizeWorld(world.width, Number(event.target.value))} />
            </label>
          </div>
          <EditableBoard world={world} selectedId={selectedId} onSelect={setSelectedId} onMove={moveSelected} />
        </section>

        <section className="builder-inspector" aria-label="对象属性">
          <div className="panel-heading">
            <h3>对象属性</h3>
            <span>{selectedObject ? describeObject(selectedObject) : '未选择对象'}</span>
          </div>

          {selectedObject ? (
            <>
              <label className="builder-field">
                <span>名称</span>
                <input value={selectedObject.id} onChange={(event) => renameSelected(event.target.value)} spellCheck={false} />
              </label>

              <div className="segmented-row" role="group" aria-label="形状">
                {shapeOptions.map((shape) => (
                  <button className={selectedObject.shape === shape ? 'active' : ''} key={shape} type="button" onClick={() => updateSelected({ shape })}>
                    {shapeLabel(shape)}
                  </button>
                ))}
              </div>

              <div className="segmented-row" role="group" aria-label="大小">
                {sizeOptions.map((size) => (
                  <button className={selectedObject.size === size ? 'active' : ''} key={size} type="button" onClick={() => updateSelected({ size })}>
                    {sizeLabel(size)}
                  </button>
                ))}
              </div>

              <div className="coordinate-fields">
                <label className="builder-field">
                  <span>X</span>
                  <input type="number" min="0" max={world.width - 1} value={selectedObject.x} onChange={(event) => moveSelected(Number(event.target.value), selectedObject.y)} />
                </label>
                <label className="builder-field">
                  <span>Y</span>
                  <input type="number" min="0" max={world.height - 1} value={selectedObject.y} onChange={(event) => moveSelected(selectedObject.x, Number(event.target.value))} />
                </label>
              </div>

              <button className="danger-button" type="button" onClick={removeSelected}>删除对象</button>
            </>
          ) : (
            <div className="empty-builder-state">添加一个对象，或在棋盘上选择已有对象。</div>
          )}

          <div className="object-list builder-object-list">
            {world.objects.map((object) => (
              <button className={selectedId === object.id ? 'object-row selected' : 'object-row'} key={object.id} type="button" onClick={() => setSelectedId(object.id)}>
                <span className={sizeClass(object)}>{shapeGlyph(object)}</span>
                <div>
                  <strong>{object.id}</strong>
                  <small>{shapeName(object)} · {object.size} · ({object.x}, {object.y})</small>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="builder-lab">
        <div className="panel-heading">
          <h3>公式验证</h3>
          <span>使用当前自建世界</span>
        </div>
        <div className="sandbox-grid">
          <label>
            <span>输入一阶公式</span>
            <input value={formula} onChange={(event) => setFormula(event.target.value)} spellCheck={false} />
          </label>
          <div className={formulaResult.ok ? 'sandbox-result' : 'sandbox-result error'}>
            {formulaResult.ok ? `结果：${formulaResult.value ? '真' : '假'}` : formulaResult.value}
          </div>
        </div>
        <div className="symbol-bank">
          {['¬', '∧', '∨', '→', '∀x', '∃x', '(', ')', '='].map((symbol) => (
            <button type="button" key={symbol} onClick={() => setFormula(`${formula} ${symbol}`.trim())}>
              {symbol}
            </button>
          ))}
        </div>
        <div className="predicate-help">
          {predicateHelp.map((item) => <code key={item}>{item}</code>)}
        </div>
      </section>

      <section className="builder-json">
        <div className="panel-heading">
          <h3>JSON 世界文件</h3>
          <span>{importMessage || '自动保存到本地浏览器'}</span>
        </div>
        <textarea value={jsonDraft} onChange={(event) => setJsonDraft(event.target.value)} spellCheck={false} />
        <div className="action-row">
          <button className="ghost-button" type="button" onClick={() => setJsonDraft(JSON.stringify(world, null, 2))}>刷新导出</button>
          <button className="primary-button" type="button" onClick={importWorld}>载入 JSON</button>
        </div>
      </section>
    </section>
  )
}

function EditableBoard({
  world,
  selectedId,
  onSelect,
  onMove,
}: {
  world: World
  selectedId: string | null
  onSelect: (id: string) => void
  onMove: (x: number, y: number) => void
}) {
  return (
    <div
      className="board editable-board"
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
          <button className={object?.id === selectedId ? 'cell selected' : 'cell'} key={`${x}-${y}`} type="button" onClick={() => object ? onSelect(object.id) : onMove(x, y)}>
            <span className="coord">{x},{y}</span>
            {object ? (
              <span className={sizeClass(object)} title={describeObject(object)}>
                <span className="piece-id">{object.id}</span>
                <span className="piece-shape">{shapeGlyph(object)}</span>
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
