const uidPrefix = 'u' + Date.now().toString(16) + Math.floor(Math.random() * (2 ** 10)).toString(16)
let uidNum = 0
export type UID = string

export const generateUID = (): UID => {
  return uidPrefix + (uidNum++).toString(16)
}
