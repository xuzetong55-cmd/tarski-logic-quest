import { LogicError, evaluateFormula, predicateHelp, type World } from '../../logic'
import { useMemo } from 'react'

type SandboxProps = {
  formula: string
  onFormulaChange: (formula: string) => void
  world: World
}

export function Sandbox({ formula, onFormulaChange, world }: SandboxProps) {
  const result = useMemo(() => {
    try {
      return { ok: true, value: evaluateFormula(formula, world) }
    } catch (error) {
      return { ok: false, value: error instanceof LogicError ? error.message : '公式无法解析' }
    }
  }, [formula, world])

  return (
    <section className="sandbox">
      <div className="panel-heading">
        <h3>自由实验</h3>
        <span>使用当前显示的世界</span>
      </div>
      <div className="sandbox-grid">
        <label>
          <span>输入公式</span>
          <input
            value={formula}
            onChange={(event) => onFormulaChange(event.target.value)}
            spellCheck={false}
          />
        </label>
        <div className={result.ok ? 'sandbox-result' : 'sandbox-result error'}>
          {result.ok ? `结果：${result.value ? '真' : '假'}` : result.value}
        </div>
      </div>
      <div className="symbol-bank">
        {['¬', '∧', '∨', '→', '∀x', '∃x', '(', ')', '='].map((symbol) => (
          <button
            type="button"
            key={symbol}
            onClick={() => onFormulaChange(`${formula} ${symbol}`.trim())}
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
  )
}
