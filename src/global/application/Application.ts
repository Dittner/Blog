import { uid } from '../domain/UIDGenerator'
import { Observable } from 'react-observable-mutations'

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

export class Application extends Observable {
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

  public readonly isMobileDevice: boolean

  constructor() {
    super('App')
    this.uid = uid()
    this._size = this.evaluateAppSize()
    this.isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)

    console.log('isMobileDevice: ' + this.isMobileDevice)
    console.log('localStorage, theme: ' + window.localStorage.getItem('theme'))
    window.addEventListener('resize', this.updateSize.bind(this))
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
}
