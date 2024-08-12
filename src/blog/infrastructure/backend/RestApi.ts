import {CheckServerCmd} from './cmd/CheckServerCmd'
import {type Author, type Book} from '../../domain/BlogModel'
import {StoreBookCmd} from './cmd/StoreBookCmd'
import {LoadAllAuthorsCmd} from './cmd/LoadAllAuthorsCmd'
import {LoadAllBooksCmd} from './cmd/LoadAllBooksCmd'
import {type Application} from '../../../global/application/Application'
import {type AnyRXObservable, type RXObservable, RXObservableEntity} from '../../../lib/rx/RXPublisher'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type RestApiErrorCategory = 'noConnection' | 'notAuthorized' | 'serverError' | 'clientError' | 'unknownError' | 'aborted'
export const NO_CONNECTION_STATUS = 0

export class RestApiError extends Error {
  readonly category: RestApiErrorCategory
  readonly statusCode: number
  constructor(category: RestApiErrorCategory, statusCode: number, message: string = '') {
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
  readonly app: Application
  headers: any = {'Content-Type': 'application/json'}

  constructor(app: Application) {
    super()
    this.baseUrl = 'http://127.0.0.1:5005/api'
    this.assetsUrl = 'http://127.0.0.1:5005/api/assets'
    console.log('RestApi, baseUrl: ', this.baseUrl)
    this.app = app
    this.isServerRunning = false
    this.checkServer()
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

  checkServer(): RXObservable<any, RestApiError> {
    const cmd = new CheckServerCmd(this)
    return cmd.run()
  }

  //--------------------------------------
  //  author
  //--------------------------------------

  loadAllAuthors(): RXObservable<Author[], RestApiError> {
    const cmd = new LoadAllAuthorsCmd(this)
    return cmd.run()
  }

  //--------------------------------------
  //  book
  //--------------------------------------

  loadAllBooks(a: Author): RXObservable<Book[], RestApiError> {
    const cmd = new LoadAllBooksCmd(this, a)
    return cmd.run()
  }

  storeBook(b: Book): RXObservable<any, RestApiError> {
    const cmd = new StoreBookCmd(this, b)
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
      //GlobalContext.self.app.errorMsg = msg
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
        throw new RestApiError('notAuthorized', response.status)
      } else if (response.status >= 500) {
        throw new RestApiError('serverError', response.status)
      } else {
        throw new RestApiError('unknownError', response.status)
      }
    } else {
      throw new RestApiError('noConnection', NO_CONNECTION_STATUS)
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
