import { Observable } from 'react-observable-mutations'
import { generateUID, type UID } from '../../global/domain/UIDGenerator'
import { type Book } from '../domain/BlogModel'
import { type RestApi } from './backend/RestApi'

export class BooksRepo extends Observable {
  readonly uid: UID
  private readonly restApi: RestApi
  private readonly pendingBooksToStore: Book[]

  get isStorePending(): boolean {
    return this.pendingBooksToStore.length > 0
  }

  constructor(restApi: RestApi) {
    super('BooksRepo')
    this.uid = generateUID()
    this.restApi = restApi
    this.pendingBooksToStore = []
  }

  addToStoreQueue(book: Book | undefined) {
    if (book) {
      this.pendingBooksToStore.push(book)
      if (this.pendingBooksToStore.length === 1) {
        this.mutated()
      }
    }
  }

  store() {
    if (this.pendingBooksToStore.length > 0) {
      const hash = new Set<UID>()
      for (const b of this.pendingBooksToStore) {
        if (hash.has(b.id)) continue
        hash.add(b.id)
        this.restApi.storeBook(b)
      }
      this.pendingBooksToStore.length = 0
      this.mutated()
    }
  }
}
