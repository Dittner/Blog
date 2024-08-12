import {type RestApi, type RestApiError, type Runnable} from '../RestApi'
import {type Book} from '../../../domain/BlogModel'
import {RXJustComplete, type RXObservable, RXOperation} from '../../../../lib/rx/RXPublisher'

export class StoreBookCmd implements Runnable {
  private readonly api: RestApi
  private readonly book: Book

  constructor(api: RestApi, b: Book) {
    this.api = api
    this.book = b
  }

  run(): RXObservable<any, RestApiError> {
    if (this.book.isStoring) return new RXJustComplete<any, RestApiError>('ok')
    this.book.isStoring = true
    const op = new RXOperation<any, RestApiError>()
    this.store(op).catch((e: RestApiError) => { op.fail(e) })
    return op.asObservable
  }

  private async store(op: RXOperation<any, RestApiError>) {
    const book = this.book
    const method = 'PUT'
    const endPoint = '/dir/' + book.author.id + '/file/' + book.id + '.txt'
    const content = book.serialize()
    const [response, _] = await this.api.sendRequest(method, endPoint, content)
    this.book.isStoring = false
    if (response?.ok) {
      op.success('ok')
    } else {
      await this.api.handlerError(response)
    }
  }
}
