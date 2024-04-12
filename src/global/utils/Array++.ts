export const uniq = (a: any[]) => {
  const seen = new Map()
  return a.filter((item) => {
    if (seen.has(item)) return false
    seen.set(item, true)
    return true
  })
}
