import { Observable } from 'react-observable-mutations'

export class BlogMenu extends Observable {
  private _isShown: boolean = true
  get isShown(): boolean { return this._isShown }
  set isShown(value: boolean) {
    if (this._isShown !== value) {
      this._isShown = value
      this.mutated()
    }
  }

  constructor() {
    super('BlogMenu')
  }
}
