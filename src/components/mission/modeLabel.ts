import type { Level } from '../../curriculum'

export function modeLabel(level: Level): string {
  if (level.mode === 'construct') return '构造模型'
  if (level.mode === 'proof') return '证明训练'
  return '判断真假'
}
