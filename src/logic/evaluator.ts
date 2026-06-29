import { type Formula, type World, type WorldObject } from './ast'
import { Parser } from './parser'
import { evaluatePredicate, getObject } from './predicates'
import { tokenize } from './tokenizer'

export function evaluateFormulaAst(
  formula: Formula,
  world: World,
  assignment: Record<string, WorldObject> = {},
): boolean {
  switch (formula.kind) {
    case 'predicate':
      return evaluatePredicate(formula.name, formula.terms, world, assignment)
    case 'equals':
      return getObject(formula.left, world, assignment) === getObject(formula.right, world, assignment)
    case 'not':
      return !evaluateFormulaAst(formula.value, world, assignment)
    case 'and':
      return evaluateFormulaAst(formula.left, world, assignment) && evaluateFormulaAst(formula.right, world, assignment)
    case 'or':
      return evaluateFormulaAst(formula.left, world, assignment) || evaluateFormulaAst(formula.right, world, assignment)
    case 'implies':
      return !evaluateFormulaAst(formula.left, world, assignment) || evaluateFormulaAst(formula.right, world, assignment)
    case 'quantifier':
      if (formula.quantifier === 'forall') {
        return world.objects.every((object) => evaluateFormulaAst(formula.body, world, { ...assignment, [formula.variable]: object }))
      }
      return world.objects.some((object) => evaluateFormulaAst(formula.body, world, { ...assignment, [formula.variable]: object }))
  }
}

export function parseFormula(input: string): Formula {
  const parser = new Parser(tokenize(input))
  return parser.parse()
}

export function evaluateFormula(input: string, world: World): boolean {
  return evaluateFormulaAst(parseFormula(input), world)
}
