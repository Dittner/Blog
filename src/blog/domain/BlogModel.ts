import { type UID, uid } from '../../global/domain/UIDGenerator'
import { Observable } from 'react-observable-mutations'

export enum AuthorLoadStatus {
  PENDING = 'PENDING',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

export class AuthorList extends Observable {
  readonly uid: UID

  constructor() {
    super('AuthorList')
    this.uid = uid()
  }

  //--------------------------------------
  //  authors
  //--------------------------------------
  private _authors = Array<Author>()
  get authors(): Author[] {
    return this._authors
  }

  set authors(value: Author[]) {
    if (this._authors !== value) {
      this._authors = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  loadStatus
  //--------------------------------------
  private _loadStatus: AuthorLoadStatus = AuthorLoadStatus.PENDING
  get loadStatus(): AuthorLoadStatus {
    return this._loadStatus
  }

  set loadStatus(value: AuthorLoadStatus) {
    if (this._loadStatus !== value) {
      this._loadStatus = value
      this.mutated()
    }
  }

  findAuthor(predicate: (a: Author) => boolean): Author | undefined {
    return this.authors.find(predicate)
  }

  add(a: Author) {
    this.authors.push(a)
    this.mutated()
  }
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

export const AUTHOR_KEY_NAME = 'NAME'
export const AUTHOR_KEY_BIOGRAPHY = 'BIOGRAPHY'
export const AUTHOR_KEY_BIRTH_YEAR = 'BIRTH_YEAR'
export const AUTHOR_KEY_DEATH_YEAR = 'DEATH_YEAR'
export const AUTHOR_KEY_PHOTO = 'PHOTO'
export const AUTHOR_KEY_BOOKS_ID = 'BOOKS'

export class Author extends Observable {
  readonly uid: string
  readonly link: string
  readonly fileUrl: string
  readonly photoUrl: string
  readonly fullName: string
  readonly shortName: string
  readonly biography: string
  readonly birthYear: string
  readonly deathYear: string
  readonly booksId: []
  readonly books: Book[]

  constructor(uid: string, fileUrl: string,
    params: any) {
    super('Author')
    this.uid = uid
    this.link = '/repo/' + uid
    this.fileUrl = fileUrl
    this.photoUrl = params[AUTHOR_KEY_PHOTO]
    this.fullName = params[AUTHOR_KEY_NAME]
    const [surName, ...rest] = this.fullName.split(' ')
    this.shortName = rest.length > 0 ? surName + ' ' + rest.map(v => v.charAt(0).toLocaleUpperCase() + '.').join('') : surName
    this.biography = params[AUTHOR_KEY_BIOGRAPHY]
    this.birthYear = params[AUTHOR_KEY_BIRTH_YEAR]
    this.deathYear = params[AUTHOR_KEY_DEATH_YEAR]
    this.booksId = params[AUTHOR_KEY_BOOKS_ID]
    this.books = []
  }

  //--------------------------------------
  //  booksLoadStatus
  //--------------------------------------
  private _booksLoadStatus: AuthorLoadStatus = AuthorLoadStatus.PENDING
  get booksLoadStatus(): AuthorLoadStatus {
    return this._booksLoadStatus
  }

  set booksLoadStatus(value: AuthorLoadStatus) {
    if (this._booksLoadStatus !== value) {
      this._booksLoadStatus = value
      this.mutated()
    }
  }

  findBook(predicate: (b: Book) => boolean): Book | undefined {
    return this.books.find(predicate)
  }

  static compare = (a: Author, b: Author) => {
    if (a.fullName > b.fullName) return -1
    if (a.fullName < b.fullName) return 1
    return 0
  }
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

export const BOOK_KEY_TITLE = 'TITLE'
export const BOOK_KEY_COVER = 'COVER'
export const BOOK_KEY_YEAR = 'YEAR'
export const BOOK_KEY_ABOUT = 'ABOUT'
export const BOOK_KEY_MARKDOWN = 'MARKDOWN'

export class Book {
  readonly id: string
  readonly author: Author
  readonly title: string
  readonly cover: string
  readonly fileUrl: string
  readonly link: string
  readonly year: string
  readonly about: string
  readonly markdown: string

  constructor(id: string,
    author: Author,
    fileUrl: string,
    markdown: string,
    params: any) {
    this.id = id
    this.author = author
    this.link = '/repo/' + author.uid + '/' + params[BOOK_KEY_TITLE]
    this.fileUrl = fileUrl
    this.title = params[BOOK_KEY_TITLE]
    this.cover = params[BOOK_KEY_COVER]
    this.year = params[BOOK_KEY_YEAR]
    this.about = params[BOOK_KEY_ABOUT] ?? ''
    this.markdown = markdown
  }

  static compare = (a: Book, b: Book) => {
    if (a.year > b.year) return -1
    if (a.year < b.year) return 1
    return 0
  }
}
