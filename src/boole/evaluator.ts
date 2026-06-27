import {
  BooleError,
  type BooleFormula,
  type FormulaClassification,
  type TruthAssignment,
  type TruthTableRow,
} from './ast'
import { parseBooleFormula } from './parser'

export type FormulaAnalysis = {
  formula: BooleFormula
  variables: string[]
  rows: TruthTableRow[]
  classification: FormulaClassification
}

export type EntailmentAnalysis = {
  premises: FormulaAnalysis[]
  conclusion: FormulaAnalysis
  variables: string[]
  rows: Array<TruthAssignment & { premisesAllTrue: boolean; conclusionTrue: boolean; counterexample: boolean }>
  valid: boolean
}

const maxTruthTableVariables = 7

export function evaluateBooleFormula(formula: BooleFormula, assignment: TruthAssignment): boolean {
  switch (formula.kind) {
    case 'variable': {
      if (!(formula.name in assignment)) {
        throw new BooleError(`命题字母 "${formula.name}" 没有赋值`)
      }
      return assignment[formula.name]
    }
    case 'not':
      return !evaluateBooleFormula(formula.value, assignment)
    case 'and':
      return evaluateBooleFormula(formula.left, assignment) && evaluateBooleFormula(formula.right, assignment)
    case 'or':
      return evaluateBooleFormula(formula.left, assignment) || evaluateBooleFormula(formula.right, assignment)
    case 'implies':
      return !evaluateBooleFormula(formula.left, assignment) || evaluateBooleFormula(formula.right, assignment)
    case 'biconditional':
      return evaluateBooleFormula(formula.left, assignment) === evaluateBooleFormula(formula.right, assignment)
  }
}

export function collectVariables(formula: BooleFormula): string[] {
  const variables = new Set<string>()
  visitFormula(formula, (name) => variables.add(name))
  return [...variables].sort((a, b) => a.localeCompare(b))
}

export function analyzeFormula(input: string): FormulaAnalysis {
  const formula = parseBooleFormula(input)
  const variables = collectVariables(formula)
  const rows = buildAssignments(variables).map((assignment) => ({
    assignment,
    value: evaluateBooleFormula(formula, assignment),
  }))

  return {
    formula,
    variables,
    rows,
    classification: classifyRows(rows),
  }
}

export function analyzeEquivalence(leftInput: string, rightInput: string): {
  left: FormulaAnalysis
  right: FormulaAnalysis
  variables: string[]
  rows: Array<TruthAssignment & { leftValue: boolean; rightValue: boolean; match: boolean }>
  equivalent: boolean
} {
  const left = analyzeFormula(leftInput)
  const right = analyzeFormula(rightInput)
  const variables = mergeVariables(left.variables, right.variables)
  const rows = buildAssignments(variables).map((assignment) => {
    const leftValue = evaluateBooleFormula(left.formula, assignment)
    const rightValue = evaluateBooleFormula(right.formula, assignment)
    return { ...assignment, leftValue, rightValue, match: leftValue === rightValue }
  })
  return { left, right, variables, rows, equivalent: rows.every((row) => row.match) }
}

export function analyzeEntailment(premiseInputs: string[], conclusionInput: string): EntailmentAnalysis {
  const premises = premiseInputs.filter((item) => item.trim()).map(analyzeFormula)
  const conclusion = analyzeFormula(conclusionInput)
  const variables = mergeVariables(...premises.map((premise) => premise.variables), conclusion.variables)
  const rows = buildAssignments(variables).map((assignment) => {
    const premisesAllTrue = premises.every((premise) => evaluateBooleFormula(premise.formula, assignment))
    const conclusionTrue = evaluateBooleFormula(conclusion.formula, assignment)
    return {
      ...assignment,
      premisesAllTrue,
      conclusionTrue,
      counterexample: premisesAllTrue && !conclusionTrue,
    }
  })
  return { premises, conclusion, variables, rows, valid: rows.every((row) => !row.counterexample) }
}

function visitFormula(formula: BooleFormula, onVariable: (name: string) => void): void {
  switch (formula.kind) {
    case 'variable':
      onVariable(formula.name)
      return
    case 'not':
      visitFormula(formula.value, onVariable)
      return
    case 'and':
    case 'or':
    case 'implies':
    case 'biconditional':
      visitFormula(formula.left, onVariable)
      visitFormula(formula.right, onVariable)
  }
}

function buildAssignments(variables: string[]): TruthAssignment[] {
  if (variables.length > maxTruthTableVariables) {
    throw new BooleError(`当前最多支持 ${maxTruthTableVariables} 个命题字母的真值表`)
  }

  const count = 2 ** variables.length
  return Array.from({ length: count }, (_, rowIndex) => {
    const assignment: TruthAssignment = {}
    variables.forEach((variable, variableIndex) => {
      assignment[variable] = Boolean((rowIndex >> (variables.length - variableIndex - 1)) & 1)
    })
    return assignment
  })
}

function classifyRows(rows: TruthTableRow[]): FormulaClassification {
  if (rows.every((row) => row.value)) return 'tautology'
  if (rows.every((row) => !row.value)) return 'contradiction'
  return 'contingency'
}

function mergeVariables(...groups: string[][]): string[] {
  return [...new Set(groups.flat())].sort((a, b) => a.localeCompare(b))
}
