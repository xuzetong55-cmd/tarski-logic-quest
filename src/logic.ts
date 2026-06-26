export type Shape = 'cube' | 'tet' | 'dodec'
export type Size = 'small' | 'medium' | 'large'

export type WorldObject = {
  id: string
  shape: Shape
  size: Size
  x: number
  y: number
}

export type World = {
  width: number
  height: number
  objects: WorldObject[]
}

type Term = { kind: 'name'; value: string }

type Formula =
  | { kind: 'predicate'; name: string; terms: Term[] }
  | { kind: 'equals'; left: Term; right: Term }
  | { kind: 'not'; value: Formula }
  | { kind: 'and' | 'or' | 'implies'; left: Formula; right: Formula }
  | { kind: 'quantifier'; quantifier: 'forall' | 'exists'; variable: string; body: Formula }

type Token = {
  type: 'word' | 'symbol' | 'eof'
  value: string
}

const predicateNames = [
  'Cube',
  'Tet',
  'Dodec',
  'Small',
  'Medium',
  'Large',
  'LeftOf',
  'RightOf',
  'FrontOf',
  'BackOf',
  'SameRow',
  'SameColumn',
  'SameShape',
  'SameSize',
  'Adjacent',
  'Between',
]

export const predicateHelp = [
  'Cube(A), Tet(A), Dodec(A)',
  'Small(A), Medium(A), Large(A)',
  'LeftOf(A, B), RightOf(A, B)',
  'FrontOf(A, B), BackOf(A, B)',
  'SameRow(A, B), SameColumn(A, B)',
  'SameShape(A, B), SameSize(A, B)',
  'Adjacent(A, B), Between(A, B, C)',
]

export class LogicError extends Error {}

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let index = 0

  while (index < input.length) {
    const char = input[index]

    if (/\s/.test(char)) {
      index += 1
      continue
    }

    const two = input.slice(index, index + 2)
    if (two === '->' || two === '&&' || two === '||') {
      tokens.push({ type: 'symbol', value: two })
      index += 2
      continue
    }

    if ('(),.=!¬∧∨→∀∃'.includes(char)) {
      tokens.push({ type: 'symbol', value: char })
      index += 1
      continue
    }

    if (/[A-Za-z_]/.test(char)) {
      let end = index + 1
      while (end < input.length && /[A-Za-z0-9_]/.test(input[end])) {
        end += 1
      }
      tokens.push({ type: 'word', value: input.slice(index, end) })
      index = end
      continue
    }

    throw new LogicError(`无法识别字符 "${char}"`)
  }

  tokens.push({ type: 'eof', value: '' })
  return tokens
}

class Parser {
  private readonly tokens: Token[]
  private cursor = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  parse(): Formula {
    const formula = this.parseImplication()
    if (this.peek().type !== 'eof') {
      throw new LogicError(`公式在 "${this.peek().value}" 附近没有结束`)
    }
    return formula
  }

  private parseImplication(): Formula {
    let left = this.parseOr()
    if (this.match('->') || this.match('→')) {
      left = { kind: 'implies', left, right: this.parseImplication() }
    }
    return left
  }

  private parseOr(): Formula {
    let left = this.parseAnd()
    while (this.match('∨') || this.match('||')) {
      left = { kind: 'or', left, right: this.parseAnd() }
    }
    return left
  }

  private parseAnd(): Formula {
    let left = this.parseUnary()
    while (this.match('∧') || this.match('&&')) {
      left = { kind: 'and', left, right: this.parseUnary() }
    }
    return left
  }

  private parseUnary(): Formula {
    if (this.match('¬') || this.match('!')) {
      return { kind: 'not', value: this.parseUnary() }
    }

    if (this.matchWord('forall') || this.match('∀')) {
      return this.parseQuantifier('forall')
    }

    if (this.matchWord('exists') || this.match('∃')) {
      return this.parseQuantifier('exists')
    }

    if (this.match('(')) {
      const inner = this.parseImplication()
      this.expect(')')
      return inner
    }

    return this.parseAtomic()
  }

  private parseQuantifier(quantifier: 'forall' | 'exists'): Formula {
    const variable = this.expectWord('量词后面需要变量名，例如 ∀x Cube(x)')
    this.match('.')
    return { kind: 'quantifier', quantifier, variable, body: this.parseUnary() }
  }

  private parseAtomic(): Formula {
    const leftWord = this.expectWord('这里需要谓词名或项')

    if (this.match('=')) {
      return {
        kind: 'equals',
        left: { kind: 'name', value: leftWord },
        right: { kind: 'name', value: this.expectWord('等号右边需要一个对象或变量') },
      }
    }

    if (!predicateNames.includes(leftWord)) {
      throw new LogicError(`未知谓词 "${leftWord}"`)
    }

    this.expect('(')
    const terms: Term[] = []
    if (!this.check(')')) {
      terms.push({ kind: 'name', value: this.expectWord('谓词参数需要对象或变量') })
      while (this.match(',')) {
        terms.push({ kind: 'name', value: this.expectWord('逗号后面需要对象或变量') })
      }
    }
    this.expect(')')

    return { kind: 'predicate', name: leftWord, terms }
  }

  private peek(): Token {
    return this.tokens[this.cursor]
  }

  private check(value: string): boolean {
    return this.peek().value === value
  }

  private match(value: string): boolean {
    if (this.peek().value !== value) return false
    this.cursor += 1
    return true
  }

  private matchWord(value: string): boolean {
    const token = this.peek()
    if (token.type !== 'word' || token.value.toLowerCase() !== value) return false
    this.cursor += 1
    return true
  }

  private expect(value: string): void {
    if (!this.match(value)) {
      throw new LogicError(`需要 "${value}"，但看到的是 "${this.peek().value || '结尾'}"`)
    }
  }

  private expectWord(message: string): string {
    const token = this.peek()
    if (token.type !== 'word') {
      throw new LogicError(message)
    }
    this.cursor += 1
    return token.value
  }
}

function getObject(term: Term, world: World, assignment: Record<string, WorldObject>): WorldObject {
  const assigned = assignment[term.value]
  if (assigned) return assigned

  const object = world.objects.find((item) => item.id === term.value)
  if (!object) {
    throw new LogicError(`找不到对象或变量 "${term.value}"`)
  }
  return object
}

function sameLine(a: WorldObject, b: WorldObject, c: WorldObject): boolean {
  const abX = b.x - a.x
  const abY = b.y - a.y
  const acX = c.x - a.x
  const acY = c.y - a.y
  return abX * acY === abY * acX
}

function between(target: WorldObject, a: WorldObject, b: WorldObject): boolean {
  if (!sameLine(a, target, b)) return false
  const withinX = Math.min(a.x, b.x) < target.x && target.x < Math.max(a.x, b.x)
  const withinY = Math.min(a.y, b.y) < target.y && target.y < Math.max(a.y, b.y)
  return (a.x === b.x || withinX) && (a.y === b.y || withinY)
}

function evaluatePredicate(name: string, terms: Term[], world: World, assignment: Record<string, WorldObject>): boolean {
  const objects = terms.map((term) => getObject(term, world, assignment))
  const [a, b, c] = objects

  switch (name) {
    case 'Cube':
      return objects.length === 1 && a.shape === 'cube'
    case 'Tet':
      return objects.length === 1 && a.shape === 'tet'
    case 'Dodec':
      return objects.length === 1 && a.shape === 'dodec'
    case 'Small':
      return objects.length === 1 && a.size === 'small'
    case 'Medium':
      return objects.length === 1 && a.size === 'medium'
    case 'Large':
      return objects.length === 1 && a.size === 'large'
    case 'LeftOf':
      return objects.length === 2 && a.x < b.x
    case 'RightOf':
      return objects.length === 2 && a.x > b.x
    case 'FrontOf':
      return objects.length === 2 && a.y > b.y
    case 'BackOf':
      return objects.length === 2 && a.y < b.y
    case 'SameRow':
      return objects.length === 2 && a.y === b.y
    case 'SameColumn':
      return objects.length === 2 && a.x === b.x
    case 'SameShape':
      return objects.length === 2 && a.shape === b.shape
    case 'SameSize':
      return objects.length === 2 && a.size === b.size
    case 'Adjacent':
      return objects.length === 2 && Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1
    case 'Between':
      return objects.length === 3 && between(a, b, c)
    default:
      throw new LogicError(`未知谓词 "${name}"`)
  }
}

function evaluateAst(formula: Formula, world: World, assignment: Record<string, WorldObject>): boolean {
  switch (formula.kind) {
    case 'predicate':
      return evaluatePredicate(formula.name, formula.terms, world, assignment)
    case 'equals':
      return getObject(formula.left, world, assignment) === getObject(formula.right, world, assignment)
    case 'not':
      return !evaluateAst(formula.value, world, assignment)
    case 'and':
      return evaluateAst(formula.left, world, assignment) && evaluateAst(formula.right, world, assignment)
    case 'or':
      return evaluateAst(formula.left, world, assignment) || evaluateAst(formula.right, world, assignment)
    case 'implies':
      return !evaluateAst(formula.left, world, assignment) || evaluateAst(formula.right, world, assignment)
    case 'quantifier':
      if (formula.quantifier === 'forall') {
        return world.objects.every((object) => evaluateAst(formula.body, world, { ...assignment, [formula.variable]: object }))
      }
      return world.objects.some((object) => evaluateAst(formula.body, world, { ...assignment, [formula.variable]: object }))
  }
}

export function evaluateFormula(input: string, world: World): boolean {
  const parser = new Parser(tokenize(input))
  return evaluateAst(parser.parse(), world, {})
}

export function describeObject(object: WorldObject): string {
  const shape = { cube: '立方体', tet: '四面体', dodec: '十二面体' }[object.shape]
  const size = { small: '小', medium: '中', large: '大' }[object.size]
  return `${object.id}: ${size}${shape} (${object.x}, ${object.y})`
}
