import type { WorldObject } from '../../logic'

export function shapeGlyph(object: WorldObject): string {
  if (object.shape === 'cube') return '□'
  if (object.shape === 'tet') return '△'
  return '⬡'
}

export function shapeName(object: WorldObject): string {
  if (object.shape === 'cube') return 'Cube'
  if (object.shape === 'tet') return 'Tet'
  return 'Dodec'
}

export function sizeClass(object: WorldObject): string {
  return `piece ${object.shape} ${object.size}`
}
