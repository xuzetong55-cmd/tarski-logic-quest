import { useMemo, useState } from 'react'
import { BooleError, analyzeEntailment, analyzeEquivalence, analyzeFormula } from '../../boole'

type BooleTab = 'table' | 'equivalence' | 'entailment'

const booleSymbols = ['¬', '∧', '∨', '→', '↔', '(', ')']

function truthLabel(value: boolean): string {
  return value ? '真' : '假'
}

function classificationLabel(classification: string): string {
  switch (classification) {
    case 'tautology':
      return '重言式'
    case 'contradiction':
      return '矛盾式'
    default:
      return '偶真式'
  }
}

function errorMessage(error: unknown): string {
  return error instanceof BooleError ? error.message : '公式无法解析'
}

export function BooleWorkbench() {
  const [activeTab, setActiveTab] = useState<BooleTab>('table')
  const [formula, setFormula] = useState('(P → Q) ↔ (¬Q → ¬P)')
  const [leftFormula, setLeftFormula] = useState('P → Q')
  const [rightFormula, setRightFormula] = useState('¬Q → ¬P')
  const [premises, setPremises] = useState('P → Q\nP')
  const [conclusion, setConclusion] = useState('Q')

  const formulaAnalysis = useMemo(() => {
    try {
      return { ok: true as const, value: analyzeFormula(formula) }
    } catch (error) {
      return { ok: false as const, value: errorMessage(error) }
    }
  }, [formula])

  const equivalenceAnalysis = useMemo(() => {
    try {
      return { ok: true as const, value: analyzeEquivalence(leftFormula, rightFormula) }
    } catch (error) {
      return { ok: false as const, value: errorMessage(error) }
    }
  }, [leftFormula, rightFormula])

  const entailmentAnalysis = useMemo(() => {
    try {
      return {
        ok: true as const,
        value: analyzeEntailment(
          premises.split('\n').map((premise) => premise.trim()),
          conclusion,
        ),
      }
    } catch (error) {
      return { ok: false as const, value: errorMessage(error) }
    }
  }, [premises, conclusion])

  function appendSymbol(symbol: string): void {
    if (activeTab === 'table') setFormula(`${formula} ${symbol}`.trim())
    if (activeTab === 'equivalence') setRightFormula(`${rightFormula} ${symbol}`.trim())
    if (activeTab === 'entailment') setConclusion(`${conclusion} ${symbol}`.trim())
  }

  return (
    <section className="boole-workbench">
      <header className="boole-header workspace-header">
        <div>
          <p className="eyebrow">Boole Mode · 0.6.0</p>
          <h2>命题逻辑工作台</h2>
        </div>
        <div className="boole-tabs" role="tablist" aria-label="Boole 工具">
          <button className={activeTab === 'table' ? 'active' : ''} type="button" onClick={() => setActiveTab('table')}>
            真值表
          </button>
          <button className={activeTab === 'equivalence' ? 'active' : ''} type="button" onClick={() => setActiveTab('equivalence')}>
            等值
          </button>
          <button className={activeTab === 'entailment' ? 'active' : ''} type="button" onClick={() => setActiveTab('entailment')}>
            蕴含
          </button>
        </div>
      </header>

      <section className="boole-panel">
        {activeTab === 'table' ? (
          <>
            <label className="boole-input">
              <span>公式</span>
              <input value={formula} onChange={(event) => setFormula(event.target.value)} spellCheck={false} />
            </label>
            {formulaAnalysis.ok ? (
              <>
                <BooleSummary
                  title={classificationLabel(formulaAnalysis.value.classification)}
                  body={`命题字母：${formulaAnalysis.value.variables.join(', ') || '无'}；共 ${formulaAnalysis.value.rows.length} 行。`}
                />
                <TruthTable
                  variables={formulaAnalysis.value.variables}
                  rows={formulaAnalysis.value.rows.map((row) => ({ ...row.assignment, result: row.value }))}
                  resultColumns={[{ key: 'result', label: formula }]}
                />
              </>
            ) : (
              <BooleErrorBox message={formulaAnalysis.value} />
            )}
          </>
        ) : null}

        {activeTab === 'equivalence' ? (
          <>
            <div className="boole-two-col">
              <label className="boole-input">
                <span>左侧公式</span>
                <input value={leftFormula} onChange={(event) => setLeftFormula(event.target.value)} spellCheck={false} />
              </label>
              <label className="boole-input">
                <span>右侧公式</span>
                <input value={rightFormula} onChange={(event) => setRightFormula(event.target.value)} spellCheck={false} />
              </label>
            </div>
            {equivalenceAnalysis.ok ? (
              <>
                <BooleSummary
                  title={equivalenceAnalysis.value.equivalent ? '两式等值' : '两式不等值'}
                  body={equivalenceAnalysis.value.equivalent ? '每一种赋值下两边真值都相同。' : '表中标出的行给出了两边真值不同的反例。'}
                />
                <TruthTable
                  variables={equivalenceAnalysis.value.variables}
                  rows={equivalenceAnalysis.value.rows}
                  resultColumns={[
                    { key: 'leftValue', label: '左式' },
                    { key: 'rightValue', label: '右式' },
                    { key: 'match', label: '相同' },
                  ]}
                  highlight={(row) => row.match === false}
                />
              </>
            ) : (
              <BooleErrorBox message={equivalenceAnalysis.value} />
            )}
          </>
        ) : null}

        {activeTab === 'entailment' ? (
          <>
            <div className="boole-two-col">
              <label className="boole-input">
                <span>前提，每行一个</span>
                <textarea value={premises} onChange={(event) => setPremises(event.target.value)} spellCheck={false} />
              </label>
              <label className="boole-input">
                <span>结论</span>
                <input value={conclusion} onChange={(event) => setConclusion(event.target.value)} spellCheck={false} />
              </label>
            </div>
            {entailmentAnalysis.ok ? (
              <>
                <BooleSummary
                  title={entailmentAnalysis.value.valid ? '有效蕴含' : '无效蕴含'}
                  body={entailmentAnalysis.value.valid ? '不存在让所有前提为真且结论为假的赋值。' : '反例行让所有前提为真，但结论为假。'}
                />
                <TruthTable
                  variables={entailmentAnalysis.value.variables}
                  rows={entailmentAnalysis.value.rows}
                  resultColumns={[
                    { key: 'premisesAllTrue', label: '前提全真' },
                    { key: 'conclusionTrue', label: '结论' },
                    { key: 'counterexample', label: '反例' },
                  ]}
                  highlight={(row) => row.counterexample === true}
                />
              </>
            ) : (
              <BooleErrorBox message={entailmentAnalysis.value} />
            )}
          </>
        ) : null}

        <div className="symbol-bank boole-symbols">
          {booleSymbols.map((symbol) => (
            <button type="button" key={symbol} onClick={() => appendSymbol(symbol)}>
              {symbol}
            </button>
          ))}
        </div>
      </section>
    </section>
  )
}

function BooleSummary({ title, body }: { title: string; body: string }) {
  return (
    <div className="boole-summary">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  )
}

function BooleErrorBox({ message }: { message: string }) {
  return (
    <div className="feedback wrong boole-error">
      <strong>解析失败</strong>
      <p>{message}</p>
    </div>
  )
}

function TruthTable({
  variables,
  rows,
  resultColumns,
  highlight,
}: {
  variables: string[]
  rows: Array<Record<string, boolean>>
  resultColumns: Array<{ key: string; label: string }>
  highlight?: (row: Record<string, boolean>) => boolean
}) {
  return (
    <div className="truth-table-wrap">
      <table className="truth-table">
        <thead>
          <tr>
            {variables.map((variable) => <th key={variable}>{variable}</th>)}
            {resultColumns.map((column) => <th key={column.key}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr className={highlight?.(row) ? 'highlight' : ''} key={index}>
              {variables.map((variable) => <td key={variable}>{truthLabel(row[variable])}</td>)}
              {resultColumns.map((column) => <td key={column.key}>{truthLabel(row[column.key])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
