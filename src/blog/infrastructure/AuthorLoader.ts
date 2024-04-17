import { type BlogContext } from '../BlogContext'
import {
  Author, AUTHOR_KEY_BIOGRAPHY,
  AUTHOR_KEY_BIRTH_YEAR,
  AUTHOR_KEY_BOOKS_ID,
  AUTHOR_KEY_NAME,
  AuthorLoadStatus
} from '../domain/BlogModel'

export class AuthorLoader {
  private readonly context: BlogContext
  private readonly parser: AuthorParser

  constructor(context: BlogContext) {
    this.context = context
    this.parser = new AuthorParser()
  }

  readonly loadAllAuthors = async() => {
    if (this.context.authorsUID.length === 0) {
      await this.loadAuthorsUID()
    }

    const articleList = this.context.authorList
    if (articleList.loadStatus !== AuthorLoadStatus.PENDING) return
    articleList.loadStatus = AuthorLoadStatus.LOADING
    for (let i = 0; i < this.context.authorsUID.length; i++) {
      await this.loadAuthor(this.context.authorsUID[i])
    }

    articleList.loadStatus = AuthorLoadStatus.LOADED
  }

  private readonly loadAuthorsUID = async() => {
    const url = '/repo/authors.txt'
    const response = await fetch(url)

    if (response.ok) {
      const uids = await response.text()
      console.trace('authors: ', uids)
      if (uids) {
        try {
          uids.split('\n').forEach(uid => this.context.authorsUID.push(uid))
        } catch (e: any) {
          console.error(e)
        }
      } else {
        console.warn('The file is not found, url: ' + url)
      }
    } else {
      const msg = `AuthorLoader.loadAuthorsUID: An error has occurred: ${response.status}`
      console.warn(msg)
      //throw new Error(message)
    }
  }

  readonly loadAuthor = async(uid: string) => {
    const url = '/repo/' + uid + '/author.txt'
    const authorList = this.context.authorList
    if (authorList.findAuthor(a => a.fileUrl === url)) return
    const response = await fetch(url)

    if (response.ok) {
      const data = await response.text()
      if (data) {
        try {
          const res = this.parser.parse(data, uid, url)
          authorList.add(res)
        } catch (e: any) {
          console.error(e)
        }
      } else {
        console.warn('The file is not found, url: ' + url)
      }
    } else {
      const msg = `AuthorLoader.loadAuthor: An error has occurred: ${response.status}`
      console.warn(msg)
      //throw new Error(message)
    }
  }
}

class AuthorParseError extends Error {
  readonly msg: string

  constructor(msg: string) {
    super(msg)
    this.msg = msg
  }

  toString() {
    return `AuthorParser: ${this.msg}`
  }
}

class AuthorParser {
  parse(data: string, uid: string, url: string): Author {
    const keyValues = data.split('\n\n')
    const params: any = {}

    for (let i = 0; i < keyValues.length; i++) {
      const keyValue = keyValues[i]
      const sepIndex = keyValue.indexOf('\n')
      const key = sepIndex === -1 ? keyValue : keyValue.substring(0, sepIndex)
      const value = sepIndex === -1 ? '' : keyValue.substring(sepIndex + 1)

      if (key === AUTHOR_KEY_BOOKS_ID) {
        params[key] = value.split('\n')
        continue
      }

      params[key] = value
    }

    this.validate(params, [AUTHOR_KEY_NAME, AUTHOR_KEY_BIOGRAPHY, AUTHOR_KEY_BIRTH_YEAR], 'Author')
    return new Author(uid, url, params)
  }

  private validate(data: any, requiredProps: string[], entityName: string): void {
    requiredProps.forEach(p => {
      if (!(p in data)) {
        throw new AuthorParseError(`The required property «${p}» of the «${entityName}» not found in file.`)
      }
    })
  }
}
