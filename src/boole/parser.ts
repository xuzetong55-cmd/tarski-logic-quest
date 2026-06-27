import { BooleError, type BooleFormula, type BooleToken } from './ast'
import { tokenizeBoole } from './tokenizer'

export function parseBooleFormula(input: string): BooleFormula {
  return new BooleParser(tokenizeBoole(input)).parse()
}

class BooleParser {
  private readonly tokens: BooleToken[]
  private cursor = 0

  constructor(tokens: BooleToken[]) {
    this.tokens = tokens
  }

  parse(): BooleFormula {
    const formula = this.parseBiconditional()
    if (this.peek().type !== 'eof') {
      throw new BooleError(`公式在 "${this.peek().value}" 附近没有结束`)
    }
    return formula
  }

  private parseBiconditional(): BooleFormula {
    let left = this.parseImplication()
    while (this.match('<->') || this.match('↔')) {
      left = { kind: 'biconditional', left, right: this.parseImplication() }
    }
    return left
  }

  private parseImplication(): BooleFormula {
    let left = this.parseOr()
    if (this.match('->') || this.match('→')) {
      left = { kind: 'implies', left, right: this.parseImplication() }
    }
    return left
  }

  private parseOr(): BooleFormula {
    let left = this.parseAnd()
    while (this.match('∨') || this.match('||')) {
      left = { kind: 'or', left, right: this.parseAnd() }
    }
    return left
  }

  private parseAnd(): BooleFormula {
    let left = this.parseUnary()
    while (this.match('∧') || this.match('&&')) {
      left = { kind: 'and', left, right: this.parseUnary() }
    }
    return left
  }

  private parseUnary(): BooleFormula {
    if (this.match('¬') || this.match('!')) {
      return { kind: 'not', value: this.parseUnary() }
    }

    if (this.match('(')) {
      const inner = this.parseBiconditional()
      this.expect(')')
      return inner
    }

    const token = this.peek()
    if (token.type !== 'word') {
      throw new BooleError('这里需要命题字母，例如 P、Q 或 Rain')
    }
    this.cursor += 1
    return { kind: 'variable', name: token.value }
  }

  private peek(): BooleToken {
    return this.tokens[this.cursor]
  }

  private match(value: string): boolean {
    if (this.peek().value !== value) return false
    this.cursor += 1
    return true
  }

  private expect(value: string): void {
    if (!this.match(value)) {
      throw new BooleError(`需要 "${value}"，但看到的是 "${this.peek().value || '结尾'}"`)
    }
  }
}
