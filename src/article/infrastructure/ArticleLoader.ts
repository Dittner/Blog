import { type ArticleContext } from '../ArticleContext'
import {
  Article,
  ARTICLE_KEY_CHAPTER,
  ARTICLE_KEY_END,
  ARTICLE_KEY_IMG, ARTICLE_KEY_MONTH, ARTICLE_KEY_PREVIEW,
  ARTICLE_KEY_QUOTE, ARTICLE_KEY_SUBTITLE, ARTICLE_KEY_TITLE, ARTICLE_KEY_UID, ARTICLE_KEY_YEAR,
  type ArticleBlock,
  ArticlesLoadStatus,
  ChapterBlock,
  ImageBlock,
  QuoteBlock,
  TextBlock
} from '../domain/ArticleModel'

export class ArticleLoader {
  private readonly context: ArticleContext
  private readonly parser: ArticleParser

  constructor(context: ArticleContext) {
    this.context = context
    this.parser = new ArticleParser()
  }

  readonly loadAllArticles = async() => {
    if (this.context.articlesUID.length === 0) {
      await this.loadArticlesUID()
    }

    const articleList = this.context.articleList
    if (articleList.loadStatus !== ArticlesLoadStatus.PENDING) return
    articleList.loadStatus = ArticlesLoadStatus.LOADING
    for (let i = 0; i < this.context.articlesUID.length; i++) {
      await this.loadArticle(this.context.articlesUID[i])
    }

    articleList.loadStatus = ArticlesLoadStatus.LOADED
  }

  private readonly loadArticlesUID = async() => {
    const url = '/blog/articles.txt'
    const response = await fetch(url)

    if (response.ok) {
      const uids = await response.text()
      if (uids) {
        try {
          uids.split('\n').forEach(uid => this.context.articlesUID.push(uid))
        } catch (e: any) {
          console.error(e)
        }
      } else {
        console.warn('File with articles is not found, url: ' + url)
      }
    } else {
      const msg = `ArticleLoader.loadArticlesURL: An error has occurred: ${response.status}`
      console.warn(msg)
      //throw new Error(message)
    }
  }

  readonly loadArticle = async(uid: string) => {
    const url = '/blog/' + uid + '/article.txt'
    const articleList = this.context.articleList
    if (articleList.findArticle(a => a.articleFileUrl === url)) return
    const response = await fetch(url)

    if (response.ok) {
      const data = await response.text()
      if (data) {
        try {
          const res = this.parser.parse(data, url)
          articleList.add(res)
        } catch (e: any) {
          console.error(e)
        }
      } else {
        console.warn('Article is not found, url: ' + url)
      }
    } else {
      const msg = `ArticleLoader.loadArticle: An error has occurred: ${response.status}`
      console.warn(msg)
      //throw new Error(message)
    }
  }
}

class ArticleParseError extends Error {
  readonly msg: string

  constructor(msg: string) {
    super(msg)
    this.msg = msg
  }

  toString() {
    return `ArticleParser: ${this.msg}`
  }
}

class ArticleParser {
  parse(data: string, url: string): Article {
    const keyValues = data.split('\n\n')
    const blocks = Array.of<ArticleBlock>()
    let chaptersCount = 0
    let curChapter: ChapterBlock | undefined
    const params: any = {}

    for (let i = 0; i < keyValues.length; i++) {
      const keyValue = keyValues[i]
      const sepIndex = keyValue.indexOf('\n')
      const key = sepIndex === -1 ? keyValue : keyValue.substring(0, sepIndex)
      const value = sepIndex === -1 ? '' : keyValue.substring(sepIndex + 1)

      if (key === ARTICLE_KEY_IMG) {
        const values = value.split('\n')
        const url = values[0] ?? ''
        const legend = values[1] ?? ''
        if (curChapter) {
          curChapter.push(new ImageBlock(url, legend))
        } else {
          blocks.push(new ImageBlock(url, legend))
        }
        continue
      }

      if (key === ARTICLE_KEY_QUOTE) {
        const values = value.split('\n')
        const text = values[0] ?? ''
        const author = values[1] ?? ''
        if (curChapter) {
          curChapter.push(new QuoteBlock(text, author))
        } else {
          blocks.push(new QuoteBlock(text, author))
        }
        continue
      }

      if (key === ARTICLE_KEY_CHAPTER) {
        curChapter = new ChapterBlock(chaptersCount, value, [])
        chaptersCount++
        blocks.push(curChapter)
        continue
      }

      if (key === ARTICLE_KEY_END) {
        curChapter = undefined
        continue
      }

      if (key === ARTICLE_KEY_UID ||
        key === ARTICLE_KEY_TITLE ||
        key === ARTICLE_KEY_SUBTITLE ||
        key === ARTICLE_KEY_PREVIEW ||
        key === ARTICLE_KEY_YEAR ||
        key === ARTICLE_KEY_MONTH) {
        params[key] = value
        continue
      }

      if (keyValue) {
        if (curChapter) {
          curChapter.push(new TextBlock(keyValue))
        } else {
          blocks.push(new TextBlock(keyValue))
        }
      }
    }

    this.validate(params, [ARTICLE_KEY_UID, ARTICLE_KEY_TITLE, ARTICLE_KEY_SUBTITLE, ARTICLE_KEY_PREVIEW, ARTICLE_KEY_YEAR, ARTICLE_KEY_MONTH], 'Article')
    return new Article(url, params, blocks)
  }

  private validate(data: any, requiredProps: string[], entityName: string): void {
    requiredProps.forEach(p => {
      if (!(p in data)) {
        throw new ArticleParseError(`The required property «${p}» of the «${entityName}» not found in file.`)
      }
    })
  }
}
