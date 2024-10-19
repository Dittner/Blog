const uidPrefix = 'u' + (Date.now() - (new Date(2020, 1, 1)).getTime()).toString(10) + 'x'
let uidNum = 0
export type UID = string

export const generateUID = (): UID => {
  return uidPrefix + (uidNum++).toString(36)
}
