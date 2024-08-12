import {generateUID, type UID} from '../../global/domain/UIDGenerator'
import {BlogContext} from '../BlogContext'
import {type RestApi} from '../infrastructure/backend/RestApi'
import {RXObservableEntity} from '../../lib/rx/RXPublisher'

interface Serializable {
  serialize: () => string
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

export class User extends RXObservableEntity<User> {
  readonly uid: UID
  readonly restApi: RestApi

  constructor(restApi: RestApi) {
    super()
    this.uid = generateUID()
    this.restApi = restApi
    console.log('new User')
    console.log('cur location:', document.location)
  }

  //--------------------------------------
  //  selectedAuthor
  //--------------------------------------
  private _selectedAuthor: Author | undefined = undefined
  get selectedAuthor(): Author | undefined { return this._selectedAuthor }
  set selectedAuthor(value: Author | undefined) {
    if (this._selectedAuthor !== value) {
      this._selectedAuthor = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  selectedBook
  //--------------------------------------
  private _selectedBook: Book | undefined = undefined
  get selectedBook(): Book | undefined { return this._selectedBook }
  set selectedBook(value: Book | undefined) {
    if (this._selectedBook !== value) {
      this._selectedBook = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  selectedChapter
  //--------------------------------------
  private _selectedChapter: string = ''
  get selectedChapter(): string { return this._selectedChapter }
  set selectedChapter(value: string) {
    if (this._selectedChapter !== value) {
      this._selectedChapter = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  authors
  //--------------------------------------
  private _authors = Array<Author>()
  get authors(): Author[] { return this._authors }
  set authors(value: Author[]) {
    if (this._authors !== value) {
      this._authors = value.sort(sortByKey('shortName'))
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

export class Author extends RXObservableEntity<Author> {
  readonly id: string
  readonly link: string
  readonly shortName: string
  readonly photoUrl: string = ''
  readonly fullName: string = ''
  readonly biography: string = ''
  readonly birthYear: string = ''
  readonly deathYear: string = ''

  constructor(id: string, params: any) {
    super()
    this.id = id
    this.shortName = id
    this.link = '/' + id
    this.photoUrl = params[AUTHOR_KEY_PHOTO] ? BlogContext.self.restApi.assetsUrl + params[AUTHOR_KEY_PHOTO] : ''
    this.fullName = params[AUTHOR_KEY_NAME]
    const [surName, ...rest] = this.fullName.split(' ')
    this.shortName = rest.length > 0 ? surName + ' ' + rest.map(v => v.charAt(0).toLocaleUpperCase() + '.').join('') : surName
    this.biography = params[AUTHOR_KEY_BIOGRAPHY]
    this.birthYear = params[AUTHOR_KEY_BIRTH_YEAR]
    this.deathYear = params[AUTHOR_KEY_DEATH_YEAR]
  }

  //--------------------------------------
  //  booksLoaded
  //--------------------------------------
  private _booksLoaded: boolean = false
  get booksLoaded(): boolean { return this._booksLoaded }
  set booksLoaded(value: boolean) {
    if (this._booksLoaded !== value) {
      this._booksLoaded = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  books
  //--------------------------------------
  private _books: Book[] = []
  get books(): Book[] { return this._books }
  set books(value: Book[]) {
    if (this._books !== value) {
      this._books = value
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
export const BOOK_KEY_GENRE = 'GENRE'
export const BOOK_KEY_ABOUT = 'ABOUT'
export const BOOK_KEY_MARKDOWN = 'MARKDOWN'

export class Book extends RXObservableEntity<Book> {
  readonly id: string
  readonly author: Author
  readonly title: string
  readonly cover: string
  readonly link: string
  readonly year: string
  readonly genre: 'movie' | 'philosophy' | 'literature'
  readonly about: string
  private _pages: Page[]
  get pages(): Page[] { return this._pages }

  constructor(id: string, author: Author, markdown: string, params: any) {
    super()
    this.id = id
    this.author = author
    this.link = '/repo/' + author.id + '/' + params[BOOK_KEY_TITLE]
    this.title = params[BOOK_KEY_TITLE]
    this.cover = params[BOOK_KEY_COVER]
    this.year = params[BOOK_KEY_YEAR]
    this.genre = params[BOOK_KEY_GENRE]
    this.about = params[BOOK_KEY_ABOUT] ?? ''
    this._pages = markdown.split('\n\n\n').map(text => new Page(this, text))
  }

  static compare = (a: Book, b: Book) => {
    if (a.year > b.year) return -1
    if (a.year < b.year) return 1
    return 0
  }

  //--------------------------------------
  //  isStoring
  //--------------------------------------
  private _isStoring: boolean = false
  get isStoring(): boolean { return this._isStoring }
  set isStoring(value: boolean) {
    if (this._isStoring !== value) {
      this._isStoring = value
    }
  }

  createPage(atIndex: number = 0): Page {
    const p = new Page(this, '')
    if (atIndex === 0) {
      this.pages.unshift(p)
    } else if (atIndex >= this._pages.length) {
      this.pages.push(p)
    } else {
      this._pages = [...this._pages.slice(0, atIndex), p, ...this._pages.slice(atIndex)]
    }
    this.mutated()
    this.store()
    return p
  }

  movePageUp(page: Page): boolean {
    const pageInd = this.pages.findIndex(p => p.uid === page.uid)
    if (pageInd !== -1 && pageInd !== 0) {
      this.pages[pageInd] = this.pages[pageInd - 1]
      this.pages[pageInd - 1] = page
      this.mutated()
      this.store()
      return true
    }
    return false
  }

  movePageDown(page: Page): boolean {
    const pageInd = this.pages.findIndex(p => p.uid === page.uid)
    if (pageInd !== -1 && pageInd < this.pages.length - 1) {
      this.pages[pageInd] = this.pages[pageInd + 1]
      this.pages[pageInd + 1] = page
      this.mutated()
      this.store()
      return true
    }
    return false
  }

  remove(page: Page): boolean {
    const pageInd = this.pages.findIndex(p => p.uid === page.uid)
    if (pageInd !== -1) {
      this.pages.splice(pageInd, 1)
      page.dispose()
      this.mutated()
      this.store()
      return true
    }
    return false
  }

  private store() {
    BlogContext.self.repo.addToStoreQueue(this)
  }

  serialize(): string {
    const END = '\n\n'
    let res = ''
    if (this.title) res += BOOK_KEY_TITLE + '\n' + this.title + END
    if (this.genre) res += BOOK_KEY_GENRE + '\n' + this.genre + END
    if (this.about) res += BOOK_KEY_ABOUT + '\n' + this.about + END
    if (this.year) res += BOOK_KEY_YEAR + '\n' + this.year + END
    if (this.cover) res += BOOK_KEY_COVER + '\n' + this.cover + END
    if (this.pages.length > 0) {
      res += BOOK_KEY_MARKDOWN + '\n'
      res += this.pages.map(p => p.serialize()).filter(p => p !== '').join('\n\n\n')
    }
    return res
  }

  dispose() {
    super.dispose()
    this.pages.forEach(b => {
      b.dispose()
    })
    this._pages = []
  }
}

export class Page extends RXObservableEntity<Page> implements Serializable {
  readonly uid = generateUID()
  readonly book: Book

  constructor(book: Book, text: string) {
    super()
    this.book = book
    this._text = text
  }

  //--------------------------------------
  //  text
  //--------------------------------------
  private _text: string = ''
  get text(): string { return this._text }
  set text(value: string) {
    if (this._text !== value) {
      this._text = value
      this.mutated()
      BlogContext.self.repo.addToStoreQueue(this.book)
    }
  }

  serialize(): string {
    return this._text
  }

  dispose() {
    super.dispose()
  }
}

const sortByKey = (key: string) => {
  return (a: any, b: any) => {
    if (a[key] < b[key]) return -1
    if (a[key] > b[key]) return 1
    return 0
  }
}
