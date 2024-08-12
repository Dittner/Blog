import {useBlogContext} from '../App'
import {User} from './domain/BlogModel'
import {BlogMenu} from './ui/BlogMenu'
import {Editor} from './ui/Editor'
import {BooksRepo} from './infrastructure/BooksRepo'
import {RestApi} from './infrastructure/backend/RestApi'
import {GlobalContext} from '../global/GlobalContext'
import {observe} from '../lib/rx/RXObserver'

export class BlogContext {
  readonly user: User
  readonly authorsUID: string[]
  readonly blogMenu: BlogMenu
  readonly editor: Editor
  readonly restApi: RestApi
  readonly repo: BooksRepo

  static self: BlogContext

  static init() {
    if (BlogContext.self === undefined) {
      BlogContext.self = new BlogContext()
    }
    return BlogContext.self
  }

  private constructor() {
    this.authorsUID = []
    this.restApi = new RestApi(GlobalContext.self.app)
    this.user = new User(this.restApi)
    this.blogMenu = new BlogMenu()
    this.editor = new Editor(this.user)
    this.repo = new BooksRepo(this.restApi)
    this.subscribeToBrowserLocation()
    this.loadAuthorList()
  }

  private subscribeToBrowserLocation() {
    GlobalContext.self.app.pipe()
      .onReceive(_ => {
        this.parseBrowserLocation()
      })
      .subscribe()
  }

  private loadAuthorList() {
    this.restApi.loadAllAuthors().pipe()
      .onReceive(res => {
        this.user.authors = res
        this.parseBrowserLocation()
      })
      .subscribe()
  }

  private parseBrowserLocation() {
    const path = document.location.pathname //'/repo/authorId/bookId#hash'
    const vv = path.split(/[/\#]/) //[ '', 'repo', 'authorId', 'bookId', 'hash' ]
    const selectedAuthor = vv.length > 2 ? this.user.findAuthor(a => a.id === vv[2]) : undefined
    const selectedBook = selectedAuthor && vv.length > 3 ? selectedAuthor.findBook(b => b.id === vv[3]) : undefined
    const selectedChapter = selectedBook ? document.location.hash : ''
    console.log('User:updateSelection, path:', path, ', authors:', this.user.authors.length, ', selectedAuthor:', selectedAuthor?.id, ', books:', selectedAuthor?.books.length)

    if (selectedAuthor && !selectedAuthor.booksLoaded) {
      this.restApi.loadAllBooks(selectedAuthor).pipe()
        .onReceive(res => {
          selectedAuthor.booksLoaded = true
          selectedAuthor.books = res
          this.parseBrowserLocation()
        })
    }

    this.user.selectedAuthor = selectedAuthor
    this.user.selectedBook = selectedBook
    this.user.selectedChapter = selectedChapter
  }
}

export function observeEditor(): Editor {
  return observe(useBlogContext().editor)
}

export function observeRepo(): BooksRepo {
  return observe(useBlogContext().repo)
}

export function observeApi(): RestApi {
  return observe(useBlogContext().restApi)
}

export function observeUser(): User {
  return observe(useBlogContext().user)
}

export function observeBlogMenu(): BlogMenu {
  return observe(useBlogContext().blogMenu)
}
