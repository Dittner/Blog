import { uid } from '../global/domain/UIDGenerator'
import { ArticleLoader } from './infrastructure/ArticleLoader'
import { observe } from 'react-observable-mutations'
import { useBlogContext } from '../App'
import { ArticleList } from './domain/ArticleModel'

export class ArticleContext {
  readonly uid = uid()
  readonly articleList: ArticleList
  readonly articleLoader: ArticleLoader
  readonly articlesUID: string[]

  static self: ArticleContext

  static init() {
    if (ArticleContext.self === undefined) {
      ArticleContext.self = new ArticleContext()
    }
    return ArticleContext.self
  }

  private constructor() {
    this.articlesUID = []
    this.articleLoader = new ArticleLoader(this)
    this.articleList = new ArticleList()
  }
}

export function observeArticleList(): ArticleList {
  return observe(useBlogContext().articleList)
}
