import {Application} from './application/Application'
import {generateUID} from './domain/UIDGenerator'
import {observe} from 'flinker-react'

export class GlobalContext {
  readonly uid = generateUID()
  readonly app: Application

  static self: GlobalContext

  static init() {
    if (GlobalContext.self === undefined) {
      GlobalContext.self = new GlobalContext()
    }
    return GlobalContext.self
  }

  private constructor() {
    this.app = new Application()
  }
}

export function observeApp(): Application {
  return observe(GlobalContext.self.app)
}
