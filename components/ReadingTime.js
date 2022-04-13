const ReadingTime = ({ value, short }) =>
  short === true ? (
    <span className="font-medium">{value.replace('read', '').replace('min', 'minuti').trim()}</span>
  ) : (
    <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
      Tempo di lettura: {value.replace('read', '').replace('min', 'minuti')}
    </p>
  )

export default ReadingTime
