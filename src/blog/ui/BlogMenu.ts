import {RXObservableEntity} from '../../lib/rx/RXPublisher'

export class BlogMenu extends RXObservableEntity<BlogMenu> {
  private _isShown: boolean = true
  get isShown(): boolean { return this._isShown }
  set isShown(value: boolean) {
    if (this._isShown !== value) {
      this._isShown = value
      this.mutated()
    }
  }
}
