import {type RXAnyOperatorProtocol, type RXOperatorProtocol} from './RXOperator'
import {type RXAnyPipeline, RXPipeline} from './RXPipeline'
import {generateSUID, type RXObject, type RXObjectType} from './RX'

//--------------------------------------
//  RXObservable
//--------------------------------------
export type AnyRXObservable = RXObservable<any, any>

export interface RXObservable<V, E> extends RXObject {
  suid: RXPublisherUID
  isComplete: boolean
  pipe(): RXOperatorProtocol<V, E>
}

//WeakRef is not supported in RN
// export class RXPipelineGarbage {
//   static self = new RXPipelineGarbage()
//   private readonly list = Array<WeakRef<RXAnyPipeline>>()
//   private total = 0
//
//   register(p: RXAnyPipeline) {
//     this.list.push(new WeakRef(p))
//     this.total++
//     this.log()
//   }
//
//   log() {
//     const disposedCount = this.list.reduce((res, ref) => ref.deref() ? res + 1 : res, 0)
//     Logger.i('GC: disposed pipelines:', disposedCount + '/' + this.total)
//   }
// }

//--------------------------------------
//  RXPublisher
//--------------------------------------
export type RXPublisherUID = number
export type RXAnyPublisher = RXPublisher<any, any>

export class RXPublisher<V, E> implements RXObservable<V, E> {
  readonly suid: RXPublisherUID = generateSUID()
  readonly type: RXObjectType = 'observable'

  protected readonly pipelines: RXAnyPipeline[]

  constructor() {
    this.pipelines = Array<RXAnyPipeline>()
  }

  get volume() { return this.pipelines.length }
  get asObservable(): RXObservable<V, E> { return this }

  protected _isComplete = false
  get isComplete(): boolean { return this._isComplete }

  pipe(): RXOperatorProtocol<V, E> {
    const pipe = new RXPipeline<V, E>(this)
    this.pipelines.push(pipe)
    //RXPipelineGarbage.self.register(pipe)
    return pipe.asOperator
  }

  didSubscribe(p: RXAnyPipeline) {
    this.isComplete && p.sendComplete(false)
  }

  private readonly pendingUnsubscribePipes = Array<RXAnyPipeline>()
  didUnsubscribe(p: RXAnyPipeline) {
    if (this.isSending) {
      this.pendingUnsubscribePipes.push(p)
      return
    }
    const index = this.pipelines.indexOf(p)
    index !== -1 && this.pipelines.splice(index, 1)
  }

  //--------------------------------------
  //  Sending methods
  //--------------------------------------

  private isSending = false
  protected send(value: V) {
    this.isSending = true
    this.pipelines.forEach(i => { i.send(value, true) })
    this.isSending = false
    this.runPendingOperations()
  }

  protected sendError(e: E) {
    this.isSending = true
    this.pipelines.forEach(i => { i.sendError(e, true) })
    this.isSending = false
    this.runPendingOperations()
  }

  protected sendComplete() {
    this.isSending = true
    this._isComplete = true
    this.pipelines.forEach(i => { i.sendComplete(true) })
    this.pipelines.length = 0
    this.isSending = false
    this.runPendingOperations()
  }

  private runPendingOperations() {
    if (this.isSending) return
    if (this.pendingUnsubscribePipes.length > 0) {
      this.pendingUnsubscribePipes.forEach(p => { this.didUnsubscribe(p) })
      this.pendingUnsubscribePipes.length = 0
    }
  }
}

//--------------------------------------
//  RXJustComplete
//--------------------------------------
export class RXJustComplete<V, E> extends RXPublisher<V, E> {
  readonly value?: V

  constructor(value?: V) {
    super()
    this.value = value
    value !== undefined && this.send(value)
    this.sendComplete()
  }

  didSubscribe(p: RXAnyPipeline) {
    this.isComplete && this.value !== undefined && p.send(this.value, false)
    this.isComplete && p.sendComplete(false)
  }
}

//--------------------------------------
//  RXJustError
//--------------------------------------
export class RXJustError<V, E> extends RXPublisher<V, E> {
  readonly error: E

  constructor(error: E) {
    super()
    this.error = error
    this.sendError(error)
    this.sendComplete()
  }

  didSubscribe(p: RXAnyPipeline) {
    this.isComplete && p.sendError(this.error, false)
    this.isComplete && p.sendComplete(false)
  }
}

//--------------------------------------
//  RXDelayedComplete
//--------------------------------------
export class RXDelayedComplete<V, E> extends RXPublisher<V, E> {
  readonly value?: V
  constructor(ms: number, value?: V) {
    super()
    this.value = value
    setTimeout(() => {
      value !== undefined && this.send(value)
      this.sendComplete()
    }, ms)
  }

  didSubscribe(p: RXAnyPipeline) {
    this.isComplete && this.value !== undefined && p.send(this.value, false)
    this.isComplete && p.sendComplete(false)
  }
}
//--------------------------------------
//  RXDelayedError
//--------------------------------------
export class RXDelayedError<V, E> extends RXPublisher<V, E> {
  readonly error: E
  constructor(ms: number, error: E) {
    super()
    this.error = error
    setTimeout(() => {
      this.sendError(error)
      this.sendComplete()
    }, ms)
  }

  didSubscribe(p: RXAnyPipeline) {
    this.isComplete && p.sendError(this.error, false)
    this.isComplete && p.sendComplete(false)
  }
}

//--------------------------------------
//  RXEmitter
//--------------------------------------

export class RXEmitter<V, E> extends RXPublisher<V, E> {
  private _hasValue = false
  private _value: V | undefined
  get value(): V | undefined { return this._value }

  private hasError = false
  private _err: E | undefined = undefined
  get err(): E | undefined { return this._err }

  constructor() {
    console.log('new RXEmitter')
    super()
  }

  override send(value: V) {
    if (this.isComplete) return
    this._value = value
    this._hasValue = true
    super.send(value)
  }

  override sendError(e: E) {
    if (this.isComplete) return
    this._err = e
    this.hasError = true
    super.sendError(e)
  }

  override sendComplete() {
    if (this.isComplete) return
    super.sendComplete()
  }

  didSubscribe(p: RXAnyPipeline) {
    this.hasError && p.sendError(this.err!, false)
    !this.hasError && this._hasValue && p.send(this.value, false)
    this.isComplete && p.sendComplete(false)
  }
}

//--------------------------------------
//  RXSubject
//--------------------------------------

export class RXSubject<V, E> extends RXPublisher<V, E> {
  private _value: V
  get value(): V { return this._value }

  private _hasError = false
  private _err: E | undefined = undefined
  get err(): E | undefined {
    return this._err
  }

  constructor(value: V) {
    super()
    this._value = value
  }

  override send(value: V) {
    if (this.isComplete) return
    this._value = value
    super.send(value)
  }

  resend() {
    super.send(this.value)
  }

  override sendError(e: E) {
    if (this.isComplete) return
    this._err = e
    this._hasError = true
    super.sendError(e)
  }

  override sendComplete() {
    if (this.isComplete) return
    this._isComplete = true
    super.sendComplete()
  }

  didSubscribe(p: RXAnyPipeline) {
    this._hasError && p.sendError(this.err!, false)
    !this._hasError && p.send(this.value, false)
    this.isComplete && p.sendComplete(false)
  }
}

//--------------------------------------
//  RXBuffer
//--------------------------------------

export class RXBuffer<V, E> extends RXPublisher<V, E> {
  private readonly values = Array<V>()
  private readonly errors = Array<E>()
  private readonly isError = Array<boolean>()

  override send(value: V) {
    if (this.isComplete) return
    this.values.push(value)
    this.isError.push(false)
    super.send(value)
  }

  override sendError(e: E) {
    if (this.isComplete) return
    this.errors.push(e)
    this.isError.push(true)
    super.sendError(e)
  }

  override sendComplete() {
    if (this.isComplete) return
    this._isComplete = true
    super.sendComplete()
  }

  didSubscribe(p: RXAnyPipeline) {
    for (let i = 0, v = 0, e = 0; i < this.isError.length; i++) {
      if (this.isError[i]) {
        e < this.errors.length && p.sendError(this.errors[e], false)
        e++
      } else {
        v < this.values.length && p.send(this.values[v], false)
        v++
      }
    }
    this.isComplete && p.sendComplete(false)
  }
}

//--------------------------------------
//  RXOperation
//--------------------------------------

export class RXOperation<V, E> extends RXPublisher<V, E> {
  private _value: V | undefined = undefined
  get value(): V | undefined { return this._value }

  private _hasError = false
  private _err: E | undefined = undefined
  get err(): E | undefined { return this._err }

  constructor() {
    console.log('new RXOperation')
    super()
  }

  success(value: V) {
    if (this.isComplete) return
    this._value = value
    super.send(value)
    super.sendComplete()
  }

  fail(e: E) {
    if (this.isComplete) return
    this._err = e
    this._hasError = true
    super.sendError(e)
    super.sendComplete()
  }

  didSubscribe(p: RXAnyPipeline) {
    console.log('RXOperation:didSubscribe, isComplete:', this.isComplete)
    if (!this.isComplete) return
    if (this._hasError) {
      p.sendError(this.err!, false)
      p.sendComplete(false)
    } else {
      console.log('----:didSubscribe, send value:', this.value)
      p.send(this.value, false)
      p.sendComplete(false)
    }
  }
}

//--------------------------------------
//  RXCombine
//--------------------------------------
export class RXCombine extends RXPublisher<any[], any> {
  private readonly _values: any[] = []
  get values(): any[] { return this._values }

  private _hasError = false
  private _err: any | undefined = undefined
  get err(): any | undefined { return this._err }

  constructor(list: Array<AnyRXObservable | RXAnyOperatorProtocol>) {
    console.log('new RXCombine')
    super()
    let count = list.length
    this._values = new Array(list.length).fill(undefined)

    list.forEach((rx, ind) => {
      const op = rx instanceof RXPublisher ? rx.asObservable.pipe() : rx as RXAnyOperatorProtocol
      op.onReceive(v => {
        this.values[ind] = v
        super.send(this.values)
      })
        .onError((e: any) => {
          this._err = e
          this._hasError = true
          super.sendError(e)
        })
        .onComplete(() => {
          count--
          if (count === 0) {
            this._isComplete = true
            super.sendComplete()
          }
        })
        .subscribe()
    })
    if (count === 0) {
      super.sendComplete()
    }
  }

  didSubscribe(p: RXAnyPipeline) {
    !this._hasError && p.send(this.values, false)
    this._hasError && p.sendError(this.err, false)
    this.isComplete && p.sendComplete(false)
  }
}

//--------------------------------------
//  RXFrom
//--------------------------------------
export class RXFrom<V, E> extends RXPublisher<V, E> {
  readonly values: V[]
  constructor(list: V[]) {
    console.log('new RXFrom')
    super()
    this.values = list
    this.sendComplete()
  }

  didSubscribe(p: RXAnyPipeline) {
    this.values.forEach(v => { p.send(v, false) })
    p.sendComplete(false)
  }
}

//--------------------------------------
//  RXWaitUntilComplete
//--------------------------------------
/*
  * wait until all publishers are complete and then send a value of the last publisher if it's specified
  * */
export class RXWaitUntilComplete<V, E> extends RXPublisher<V, E> {
  private _value: V | undefined = undefined
  get value(): V | undefined { return this._value }

  private readonly _resultPublisher: RXObservable<V, E> | undefined
  private _hasError = false
  private _err: any | undefined = undefined
  get err(): any | undefined { return this._err }

  constructor(list: AnyRXObservable[] | AnyRXObservable, resultPublisher?: RXObservable<V, E>) {
    console.log('new RXSequence')
    super()
    this._resultPublisher = resultPublisher
    let count = Array.isArray(list) ? list.length : 1

    if (Array.isArray(list)) {
      list.forEach(ob =>
        ob.pipe()
          .onError(e => {
            this._err = e
            this._hasError = true
            super.sendError(e)
          })
          .onComplete(() => {
            count--
            if (count === 0) this.subscribeToResultPublisher()
          })
          .subscribe()
      )
      if (count === 0) this.subscribeToResultPublisher()
    } else {
      list.pipe()
        .onError(e => {
          this._err = e
          this._hasError = true
          super.sendError(e)
        })
        .onComplete(() => {
          this.subscribeToResultPublisher()
        })
        .subscribe()
    }
  }

  private subscribeToResultPublisher() {
    if (this._resultPublisher) {
      this._resultPublisher.pipe()
        .onReceive(v => {
          this._value = v
          super.send(v)
        })
        .onError((e: any) => {
          this._err = e
          this._hasError = true
          super.sendError(e)
        })
        .onComplete(() => {
          this._isComplete = true
          super.sendComplete()
        })
        .subscribe()
    } else {
      this._isComplete = true
      super.sendComplete()
    }
  }

  didSubscribe(p: RXAnyPipeline) {
    !this._hasError && this.isComplete && this._resultPublisher?.isComplete && p.send(this.value, false)
    this._hasError && p.sendError(this.err, false)
    this.isComplete && p.sendComplete(false)
  }
}

/*
*
* UI
*
* */

//--------------------------------------
//  RXObservableEntity
//--------------------------------------
export class RXObservableEntity<V> extends RXPublisher<V, any> {
  protected mutated() {
    this.send(this)
  }

  protected override send(value: any) {
    super.send(value)
  }

  protected dispose() {
    this.sendComplete()
  }

  didSubscribe(p: RXAnyPipeline) {
    p.send(this, false)
    this.isComplete && p.sendComplete(false)
  }
}

//--------------------------------------
//  RXMutableValue
//--------------------------------------
export class RXObservableValue<V> extends RXPublisher<V, any> {
  private _value: V
  get value(): V { return this._value }
  set value(value: V) {
    if (value !== this._value) {
      this._value = value
      super.send(value)
    }
  }

  constructor(value: V) {
    super()
    this._value = value
  }

  didSubscribe(p: RXAnyPipeline) {
    p.send(this.value, false)
    this.isComplete && p.sendComplete(false)
  }
}

//--------------------------------------
//  RXObservableSender
//--------------------------------------

// export class RXObservableSender<V> extends RXPublisher<V, any> {
//   private _value: V
//   get value(): V { return this._value }
//   set value(v: V) {
//     if (v !== this._value) {
//       this._value = v
//     }
//   }
//
//   override send(value: V) {
//     if (this._value !== value) {
//       this._value = value
//       super.send(value)
//     }
//   }
//
//   constructor(value: V) {
//     super()
//     this._value = value
//   }
// }
