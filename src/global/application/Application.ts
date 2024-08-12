import {generateUID} from '../domain/UIDGenerator'
import {RXObservableEntity} from '../../lib/rx/RXPublisher'

export enum LayoutLayer {
  MINUS = '-1',
  ZERO = '0',
  ONE = '1',
  HEADER = '10',
  DOC_LIST = '20',
  POPUP = '30',
  ERR_MSG = '40',
  MODAL = '50',
}

export enum AppSize {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L'
}

export class Application extends RXObservableEntity<Application> {
  readonly uid

  //--------------------------------------
  //  size
  //--------------------------------------
  private _size: AppSize
  get size(): AppSize { return this._size }
  set size(value: AppSize) {
    if (this._size !== value) {
      this._size = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  errorMsg
  //--------------------------------------
  private _errorMsg: string = ''
  get errorMsg(): string { return this._errorMsg }
  set errorMsg(value: string) {
    if (this._errorMsg !== value) {
      this._errorMsg = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  location
  //--------------------------------------
  private _location: string = ''
  get location(): string { return this._location }
  private set location(value: string) {
    if (this._location !== value) {
      this._location = value
      this.mutated()
    }
  }

  public readonly isMobileDevice: boolean

  constructor() {
    super()
    this.uid = generateUID()
    this._size = this.evaluateAppSize()
    this.isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)

    console.log('isMobileDevice: ' + this.isMobileDevice)
    console.log('localStorage, theme: ' + window.localStorage.getItem('theme'))
    window.addEventListener('resize', this.updateSize.bind(this))
    this.watchHistoryEvents()
  }

  private updateSize(): void {
    const evaluatedSize = this.evaluateAppSize()
    if (this.size !== evaluatedSize) {
      this.size = evaluatedSize
    }
  }

  private evaluateAppSize(): AppSize {
    if (window.innerWidth > 1500) return AppSize.L
    if (window.innerWidth > 1200) return AppSize.M
    if (window.innerWidth > 767) return AppSize.S
    return AppSize.XS
  }

  private watchHistoryEvents() {
    const {pushState, replaceState} = window.history

    window.history.pushState = function(...args) {
      pushState.apply(window.history, args)
      window.dispatchEvent(new Event('pushState'))
      console.log('!!!! cur location:', document.location.pathname)
    }

    window.history.replaceState = function(...args) {
      replaceState.apply(window.history, args)
      window.dispatchEvent(new Event('replaceState'))
      console.log('!!!! cur location:', document.location.pathname)
    }

    window.addEventListener('popstate', () => { this.updateLocation() })
    window.addEventListener('replaceState', () => { this.updateLocation() })
    window.addEventListener('pushState', () => { this.updateLocation() })
  }

  private updateLocation() {
    this.location = document.location.hash ? document.location.pathname + '#' + document.location.hash : document.location.pathname
  }
}
