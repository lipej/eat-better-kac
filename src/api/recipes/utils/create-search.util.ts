export const mountSearch = (searchQuery: string) => {
  if (!searchQuery) return { published: true, deletedAt: null }

  const contains: string[] = []
  const notContains: string[] = []

  searchQuery.split(',').forEach((value) => {
    if (value[0] === '!') notContains.push(value.replace('!', ''))
    else contains.push(value)
  })

  const withContains = contains.length
    ? `${contains.map((value) => `'${value}'`).join(' | ')}`
    : false

  const withNotContains = notContains.length
    ? `(${notContains.map((value) => `!'${value}'`).join(' & ')})`
    : false

  const hasBoth = withContains && withNotContains ? `${withContains} & ${withNotContains}` : false

  const search = hasBoth ? hasBoth : withContains || withNotContains

  return {
    title: { search },
    time: { search },
    ingredients: { search },
    published: true,
    deletedAt: null
  }
}
