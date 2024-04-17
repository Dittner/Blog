import { uid } from '../global/domain/UIDGenerator'
import { observe } from 'react-observable-mutations'
import { useBlogContext } from '../App'
import { AuthorList } from './domain/BlogModel'
import { AuthorLoader } from './infrastructure/AuthorLoader'
import { BookLoader } from './infrastructure/BookLoader'
import { BlogMenu } from './ui/BlogMenu'

export class BlogContext {
  readonly uid = uid()
  readonly authorList: AuthorList
  readonly authorLoader: AuthorLoader
  readonly bookLoader: BookLoader
  readonly authorsUID: string[]
  readonly blogMenu: BlogMenu

  static self: BlogContext

  static init() {
    if (BlogContext.self === undefined) {
      BlogContext.self = new BlogContext()
    }
    return BlogContext.self
  }

  private constructor() {
    this.authorsUID = []
    this.authorLoader = new AuthorLoader(this)
    this.bookLoader = new BookLoader()
    this.authorList = new AuthorList()
    this.blogMenu = new BlogMenu()
  }
}

export function observeAuthorList(): AuthorList {
  return observe(useBlogContext().authorList)
}

export function observeBlogMenu(): BlogMenu {
  return observe(useBlogContext().blogMenu)
}
