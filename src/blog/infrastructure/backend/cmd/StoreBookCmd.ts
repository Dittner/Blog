import { type RestApiCmd } from './RestApiCmd'
import { type RestApi } from '../RestApi'
import { type Book } from '../../../domain/BlogModel'

export class StoreBookCmd implements RestApiCmd {
  private readonly api: RestApi
  private readonly book: Book

  constructor(api: RestApi, b: Book) {
    this.api = api
    this.book = b
  }

  run() {
    if (!this.book.isStoring) {
      this.book.isStoring = true
      this.store().then()
    }
  }

  private async store() {
    const book = this.book
    const method = 'PUT'
    const endPoint = '/dir/' + book.author.id + '/file/' + book.id + '.txt'
    const content = book.serialize()
    await this.api.sendRequest(method, endPoint, content)
    this.book.isStoring = false
  }
}
