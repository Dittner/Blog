import { GlobalContext } from '../../../global/GlobalContext'
import { Observable } from 'react-observable-mutations'
import { CheckServerCmd } from './cmd/CheckServerCmd'
import { type Author, type Book } from '../../domain/BlogModel'
import { type BlogContext } from '../../BlogContext'
import { StoreBookCmd } from './cmd/StoreBookCmd'
import { LoadAllAuthorsCmd } from './cmd/LoadAllAuthorsCmd'
import { LoadAllBooksCmd } from './cmd/LoadAllBooksCmd'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export class RestApi extends Observable {
  readonly baseUrl: string
  readonly assetsUrl: string
  readonly context: BlogContext
  headers: any = { 'Content-Type': 'application/json' }

  constructor(context: BlogContext) {
    super('RestApi')
    this.baseUrl = 'http://127.0.0.1:5005/api'
    this.assetsUrl = 'http://127.0.0.1:5005/api/assets'
    console.log('RestApi, baseUrl: ', this.baseUrl)
    this.context = context
    this.isServerRunning = false
    this.checkServer()
  }

  //--------------------------------------
  //  isServerRunning
  //--------------------------------------
  private _isServerRunning: boolean = false
  get isServerRunning(): boolean {
    return this._isServerRunning
  }

  set isServerRunning(value: boolean) {
    if (this._isServerRunning !== value) {
      this._isServerRunning = value
      this.mutated()
    }
  }

  checkServer() {
    const cmd = new CheckServerCmd(this)
    cmd.run()
  }

  //--------------------------------------
  //  author
  //--------------------------------------

  loadAllAuthors() {
    const cmd = new LoadAllAuthorsCmd(this)
    cmd.run()
  }

  //--------------------------------------
  //  book
  //--------------------------------------

  loadAllBooks(a: Author) {
    const cmd = new LoadAllBooksCmd(this, a)
    cmd.run()
  }

  storeBook(b: Book) {
    const cmd = new StoreBookCmd(this, b)
    cmd.run()
  }

  //--------------------------------------
  //  sendRequest
  //--------------------------------------

  async sendRequest(method: HttpMethod, path: string, body: string | null = null, handleErrors: boolean = true): Promise<[Response | null, any | null]> {
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
      } else if (handleErrors) {
        const details = await this.getResponseDetails(response) ?? ''

        if (response.status === 401 || response.status === 403) {
          console.warn('Authorization is required!')
        } else if (response.status >= 500) {
          GlobalContext.self.app.errorMsg = response.status + ': Internal server error'
        } else if (response.status === 400) {
          GlobalContext.self.app.errorMsg = response.status + ': ' + details ?? 'Bad Request'
        } else {
          GlobalContext.self.app.errorMsg = response.status + ': ' + details ?? 'Unknown error'
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

  async getResponseDetails(response: Response) {
    try {
      const details = await response.text()
      console.log('Details:', details)
      return details
    } catch (_) {}
    return null
  }
}
