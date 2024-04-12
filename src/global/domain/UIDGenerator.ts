const uidPrefix = Date.now().toString(16) + '-' + Math.floor(Math.random() * (2 ** 32)).toString(16)
let uidNum = 0
export type UID = string

export const uid = (): UID => {
  return uidPrefix + '-' + (uidNum++).toString(16)
}
