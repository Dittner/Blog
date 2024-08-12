import {Application} from './application/Application'
import {useGlobalContext} from '../App'
import {generateUID} from './domain/UIDGenerator'
import {observe} from '../lib/rx/RXObserver'

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
  return observe(useGlobalContext().app)
}
