import {PingCmd} from './cmd/PingCmd'
import {type File} from '../../domain/BlogModel'
import {StoreFileCmd} from './cmd/StoreFileCmd'
import {LoadChildrenFilesCmd} from './cmd/LoadChildrenFilesCmd'
import {type AnyRXObservable, type RXObservable, RXObservableEntity} from '../../../lib/rx/RXPublisher'
import {globalContext} from '../../../App'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type RestApiErrorCategory = 'noConnection' | 'notAuthorized' | 'serverError' | 'clientError' | 'unknownError' | 'aborted'
export const NO_CONNECTION_STATUS = 0

export class RestApiError extends Error {
  readonly category: RestApiErrorCategory
  readonly statusCode: number
  constructor(category: RestApiErrorCategory, statusCode: number, message: string) {
    super(message)
    this.category = category
    this.statusCode = statusCode
    this.message = message
  }

  toString(): string {
    return 'RestApiError: ' + this.category + ', code: ' + this.statusCode + ', details: ' + this.message
  }
}

export interface Runnable {
  run: () => AnyRXObservable
}

export class RestApi extends RXObservableEntity<RestApi> {
  readonly baseUrl: string
  readonly assetsUrl: string
  headers: any = {'Content-Type': 'application/json'}

  constructor() {
    super()
    this.baseUrl = 'http://127.0.0.1:5005/api'
    this.assetsUrl = 'http://127.0.0.1:5005/api/asset'
    console.log('RestApi, baseUrl: ', this.baseUrl)
    this.isServerRunning = false
    this.ping()
  }

  //--------------------------------------
  //  isServerRunning
  //--------------------------------------
  private _isServerRunning: boolean = false
  get isServerRunning(): boolean { return this._isServerRunning }
  set isServerRunning(value: boolean) {
    if (this._isServerRunning !== value) {
      this._isServerRunning = value
      this.mutated()
    }
  }

  ping(): RXObservable<any, RestApiError> {
    const cmd = new PingCmd(this)
    return cmd.run()
  }

  //--------------------------------------
  //  dir
  //--------------------------------------

  loadChildrenFiles(dir: File): RXObservable<any, RestApiError> {
    const cmd = new LoadChildrenFilesCmd(this, dir)
    return cmd.run()
  }

  storeFile(f: File): RXObservable<any, RestApiError> {
    const cmd = new StoreFileCmd(this, f)
    return cmd.run()
  }

  //--------------------------------------
  //  sendRequest
  //--------------------------------------

  async sendRequest(method: HttpMethod, path: string, body: string | null = null): Promise<[Response | null, any | null]> {
    try {
      console.log('===>', method, ':', path)
      const response = await fetch(this.baseUrl + path, {
        method,
        headers: this.headers,
        credentials: 'same-origin',
        body
      })

      console.log('<===', response.status, method, path)

      if (response.ok) {
        if (response.status === 204) {
          return [response, null]
        } else {
          try {
            const body = await response.json()
            return [response, body]
          } catch (_) {
          }
        }
      }
      return [response, null]
    } catch (e: any) {
      const msg = 'Unable to ' + method + ' resource: ' + this.baseUrl + path
      globalContext.app.errorMsg = msg
      console.log(msg, '. Details:', e)
      return [null, null]
    }
  }

  async handlerError(response: Response | null): Promise<never> {
    if (response) {
      const details = (await this.getResponseDetails(response)) ?? ''
      console.log('Response status:', response.status)
      console.log('Problem details:', details)
      if (response.status === 401 || response.status === 403) {
        throw new RestApiError('notAuthorized', response.status, 'User not authorized')
      } else if (response.status === 400) {
        throw new RestApiError('clientError', response.status, details)
      } else if (response.status === 404) {
        throw new RestApiError('clientError', response.status, details)
      } else if (response.status >= 500) {
        throw new RestApiError('serverError', response.status, 'Server error: ' + details)
      } else {
        throw new RestApiError('unknownError', response.status, 'Unknown error: ' + details)
      }
    } else {
      throw new RestApiError('noConnection', NO_CONNECTION_STATUS, 'No response')
    }
  }

  async getResponseDetails(response: Response) {
    try {
      const details = await response.text()
      console.log('Details:', details)
      return details
    } catch (_) {}
    return null
  }
}
