import { type UID, uid } from '../../global/domain/UIDGenerator'
import { Observable } from 'react-observable-mutations'

export enum ArticlesLoadStatus {
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

export class ArticleList extends Observable {
  readonly uid: UID

  constructor() {
    super('ArticleList')
    this.uid = uid()
  }

  //--------------------------------------
  //  articles
  //--------------------------------------
  private _articles = Array<Article>()
  get articles(): Article[] {
    return this._articles
  }

  set articles(value: Article[]) {
    if (this._articles !== value) {
      this._articles = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  loadStatus
  //--------------------------------------
  private _loadStatus: ArticlesLoadStatus = ArticlesLoadStatus.PENDING
  get loadStatus(): ArticlesLoadStatus {
    return this._loadStatus
  }

  set loadStatus(value: ArticlesLoadStatus) {
    if (this._loadStatus !== value) {
      this._loadStatus = value
      this.mutated()
    }
  }

  findArticle(predicate: (a: Article) => boolean): Article | undefined {
    return this.articles.find(predicate)
  }

  add(a: Article) {
    this.articles.push(a)
    this.mutated()
  }
}

export const ARTICLE_KEY_UID = 'UID'
export const ARTICLE_KEY_TITLE = 'TITLE'
export const ARTICLE_KEY_SUBTITLE = 'SUBTITLE'
export const ARTICLE_KEY_YEAR = 'YEAR'
export const ARTICLE_KEY_MONTH = 'MONTH'
export const ARTICLE_KEY_PREVIEW = 'PREVIEW'
export const ARTICLE_KEY_CHAPTER = 'CHAPTER'
export const ARTICLE_KEY_IMG = 'IMG'
export const ARTICLE_KEY_TEXT = 'TXT'
export const ARTICLE_KEY_QUOTE = 'QUOTE'
export const ARTICLE_KEY_END = 'END'

export class Article {
  readonly uid: string
  readonly link: string
  readonly articleFileUrl: string
  readonly title: string
  readonly subTitle: string
  readonly preview: string
  readonly year: number
  readonly month: number
  readonly blocks: ArticleBlock[]

  constructor(articleFileUrl: string,
    params: any,
    blocks: ArticleBlock[]) {
    this.uid = params[ARTICLE_KEY_UID]
    this.link = '/blog/' + params[ARTICLE_KEY_UID]
    this.articleFileUrl = articleFileUrl
    this.title = params[ARTICLE_KEY_TITLE]
    this.subTitle = params[ARTICLE_KEY_SUBTITLE]
    this.preview = params[ARTICLE_KEY_PREVIEW]
    this.year = params[ARTICLE_KEY_YEAR] as number
    this.month = params[ARTICLE_KEY_MONTH] as number
    this.blocks = blocks
  }

  static compare = (a: Article, b: Article) => {
    if (a.year > b.year) return -1
    if (a.year < b.year) return 1
    if (a.month > b.month) return -1
    if (a.month < b.month) return 1
    return 0
  }
}

export interface ArticleBlock {
  uid: string
  type: string
}

export class TextBlock implements ArticleBlock {
  readonly uid = uid()
  readonly type = ARTICLE_KEY_TEXT
  readonly text: string

  constructor(text: string) {
    this.text = text
  }
}

export class ImageBlock implements ArticleBlock {
  readonly uid = uid()
  readonly type = ARTICLE_KEY_IMG
  readonly url: string
  readonly legend: string

  constructor(url: string, legend: string) {
    this.url = url
    this.legend = legend
  }
}

export class QuoteBlock implements ArticleBlock {
  readonly uid = uid()
  readonly type = ARTICLE_KEY_QUOTE
  readonly text: string
  readonly author: string

  constructor(text: string, author: string) {
    this.text = text
    this.author = author
  }
}

export class ChapterBlock implements ArticleBlock {
  readonly uid = uid()
  readonly type = ARTICLE_KEY_CHAPTER
  readonly index: number
  readonly title: string
  readonly blocks: ArticleBlock[]

  constructor(index: number, title: string, blocks: ArticleBlock[]) {
    this.index = index
    this.title = title
    this.blocks = blocks
  }

  push(block: ArticleBlock) {
    this.blocks.push(block)
  }
}
