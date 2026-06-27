export type BooleFormula =
  | { kind: 'variable'; name: string }
  | { kind: 'not'; value: BooleFormula }
  | { kind: 'and' | 'or' | 'implies' | 'biconditional'; left: BooleFormula; right: BooleFormula }

export type BooleToken = {
  type: 'word' | 'symbol' | 'eof'
  value: string
}

export type TruthAssignment = Record<string, boolean>

export type TruthTableRow = {
  assignment: TruthAssignment
  value: boolean
}

export type FormulaClassification = 'tautology' | 'contradiction' | 'contingency'

export class BooleError extends Error {}
