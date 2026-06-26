export type LplSoftwareMode = 'boole' | 'tarski' | 'fitch' | 'textbook'

export type LplExerciseStatus = 'placeholder' | 'in-progress' | 'complete' | 'review'

export type LplExerciseRef = {
  id: string
  chapter: number
  exercise: string
  mode: LplSoftwareMode
  skills: string[]
  status: LplExerciseStatus
  localPath?: string
  notes?: string
}

export type LplChapter = {
  number: number
  title: string
  focus: string
  modes: LplSoftwareMode[]
  exerciseRefs: LplExerciseRef[]
}

export const privateContentRoot = 'private-content/lpl'

export function lplLocalPath(chapter: number, exercise: string): string {
  const chapterFolder = `ch${String(chapter).padStart(2, '0')}`
  return `${privateContentRoot}/${chapterFolder}/${exercise}.md`
}
