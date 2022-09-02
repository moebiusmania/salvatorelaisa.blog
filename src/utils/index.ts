import readingTime from 'reading-time'

type RawContent = <T>() => string

export const reading = (rawContent: RawContent): string =>
  Math.ceil(readingTime(rawContent()).minutes) + ' minuti'
