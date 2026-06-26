import { LogicError, type Term, type World, type WorldObject } from './ast'

export const predicateNames = [
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

export function getObject(term: Term, world: World, assignment: Record<string, WorldObject>): WorldObject {
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

export function evaluatePredicate(
  name: string,
  terms: Term[],
  world: World,
  assignment: Record<string, WorldObject>,
): boolean {
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

export function describeObject(object: WorldObject): string {
  const shape = { cube: '立方体', tet: '四面体', dodec: '十二面体' }[object.shape]
  const size = { small: '小', medium: '中', large: '大' }[object.size]
  return `${object.id}: ${size}${shape} (${object.x}, ${object.y})`
}
