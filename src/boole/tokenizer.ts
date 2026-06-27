import { BooleError, type BooleToken } from './ast'

export function tokenizeBoole(input: string): BooleToken[] {
  const tokens: BooleToken[] = []
  let index = 0

  while (index < input.length) {
    const char = input[index]

    if (/\s/.test(char)) {
      index += 1
      continue
    }

    const three = input.slice(index, index + 3)
    if (three === '<->') {
      tokens.push({ type: 'symbol', value: three })
      index += 3
      continue
    }

    const two = input.slice(index, index + 2)
    if (two === '->' || two === '&&' || two === '||') {
      tokens.push({ type: 'symbol', value: two })
      index += 2
      continue
    }

    if ('()!¬∧∨→↔'.includes(char)) {
      tokens.push({ type: 'symbol', value: char })
      index += 1
      continue
    }

    if (/[A-Za-z]/.test(char)) {
      let end = index + 1
      while (end < input.length && /[A-Za-z0-9_]/.test(input[end])) {
        end += 1
      }
      tokens.push({ type: 'word', value: input.slice(index, end) })
      index = end
      continue
    }

    throw new BooleError(`无法识别字符 "${char}"`)
  }

  tokens.push({ type: 'eof', value: '' })
  return tokens
}
