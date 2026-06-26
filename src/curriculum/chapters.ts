import { levels } from './levels'

export const chapters = Array.from(new Set(levels.map((level) => level.chapter))).map((chapter) => ({
  title: chapter,
  levels: levels.filter((level) => level.chapter === chapter),
}))
