import { generateUID } from '../global/domain/UIDGenerator'
import { observe } from 'react-observable-mutations'
import { useBlogContext } from '../App'
import { AuthorList } from './domain/BlogModel'
import { BlogMenu } from './ui/BlogMenu'
import { Editor } from './ui/Editor'
import { BooksRepo } from './infrastructure/BooksRepo'
import { RestApi } from './infrastructure/backend/RestApi'

export class BlogContext {
  readonly uid = generateUID()
  readonly authorList: AuthorList
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
    this.authorList = new AuthorList()
    this.blogMenu = new BlogMenu()
    this.editor = new Editor()
    this.restApi = new RestApi(this)
    this.repo = new BooksRepo(this.restApi)
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

export function observeAuthorList(): AuthorList {
  return observe(useBlogContext().authorList)
}

export function observeBlogMenu(): BlogMenu {
  return observe(useBlogContext().blogMenu)
}
