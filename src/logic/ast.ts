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

export type Term = { kind: 'name'; value: string }

export type Formula =
  | { kind: 'predicate'; name: string; terms: Term[] }
  | { kind: 'equals'; left: Term; right: Term }
  | { kind: 'not'; value: Formula }
  | { kind: 'and' | 'or' | 'implies'; left: Formula; right: Formula }
  | { kind: 'quantifier'; quantifier: 'forall' | 'exists'; variable: string; body: Formula }

export type Token = {
  type: 'word' | 'symbol' | 'eof'
  value: string
}

export class LogicError extends Error {}
