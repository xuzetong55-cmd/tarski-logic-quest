import { LogicError, type Formula, type Term, type Token } from './ast'
import { predicateNames } from './predicates'

export class Parser {
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
