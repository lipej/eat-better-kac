export const mountSearch = (search: string) => {
  const contains: string[] = []
  const notContains: string[] = []

  search.split(',').forEach((value) => {
    if (value[0] === '!') notContains.push(value.replace('!', ''))
    else contains.push(value)
  })

  return `${contains.map((value) => `'${value}'`).join(' | ')} & (${notContains
    .map((value) => `!'${value}'`)
    .join(' & ')})`
}
