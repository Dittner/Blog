import { uid } from '../global/domain/UIDGenerator'
import { observe } from 'react-observable-mutations'
import { useLibraryContext } from '../App'
import { AuthorList } from './domain/LibraryModel'
import { AuthorLoader } from './infrastructure/AuthorLoader'
import { BookLoader } from './infrastructure/BookLoader'

export class LibraryContext {
  readonly uid = uid()
  readonly authorList: AuthorList
  readonly authorLoader: AuthorLoader
  readonly bookLoader: BookLoader
  readonly authorsUID: string[]

  static self: LibraryContext

  static init() {
    if (LibraryContext.self === undefined) {
      LibraryContext.self = new LibraryContext()
    }
    return LibraryContext.self
  }

  private constructor() {
    this.authorsUID = []
    this.authorLoader = new AuthorLoader(this)
    this.bookLoader = new BookLoader()
    this.authorList = new AuthorList()
  }
}

export function observeAuthorList(): AuthorList {
  return observe(useLibraryContext().authorList)
}
