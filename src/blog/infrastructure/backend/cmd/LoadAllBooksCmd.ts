import { type RestApiCmd } from './RestApiCmd'
import { type RestApi } from '../RestApi'
import {
  type Author,
  type AuthorList,
  LoadStatus,
  Book,
  BOOK_KEY_ABOUT,
  BOOK_KEY_COVER,
  BOOK_KEY_GENRE,
  BOOK_KEY_MARKDOWN,
  BOOK_KEY_TITLE,
  BOOK_KEY_YEAR
} from '../../../domain/BlogModel'

export class LoadAllBooksCmd implements RestApiCmd {
  private readonly api: RestApi
  private readonly authorList: AuthorList
  private readonly parser: BookParser
  private readonly author: Author

  constructor(api: RestApi, author: Author) {
    this.api = api
    this.authorList = api.context.authorList
    this.author = author
    this.parser = new BookParser()
  }

  run() {
    if (this.author.booksLoadStatus === LoadStatus.PENDING) {
      this.author.booksLoadStatus = LoadStatus.LOADING
      this.startLoading().then()
    }
  }

  private async startLoading() {
    const [response, body] = await this.api.sendRequest('GET', '/dir/' + this.author.id)
    if (response?.ok) {
      const dict: Record<string, string> = body
      const books = []
      for (const [bookId, bookData] of Object.entries(dict)) {
        books.push(this.parser.parse(bookId, bookData, this.author))
      }
      this.author.books = books
      this.author.booksLoadStatus = LoadStatus.LOADED
    } else {
      this.author.booksLoadStatus = LoadStatus.ERROR
    }
  }
}

class ParseError extends Error {
  readonly msg: string

  constructor(msg: string) {
    super(msg)
    this.msg = msg
  }

  toString() {
    return `BookParser: ${this.msg}`
  }
}

class BookParser {
  parse(bookId: string, data: string, a: Author): Book {
    console.log('BookParser, author: ' + a.fullName + ', bookId: ' + bookId)
    const keyValues = data.split('\n\n')
    const params: any = {}
    let markdown = ''
    const keys = [BOOK_KEY_TITLE, BOOK_KEY_COVER, BOOK_KEY_YEAR, BOOK_KEY_ABOUT, BOOK_KEY_GENRE]

    for (let i = 0; i < keyValues.length; i++) {
      const keyValue = keyValues[i]
      const sepIndex = keyValue.indexOf('\n')
      const key = sepIndex === -1 ? keyValue : keyValue.substring(0, sepIndex)
      const value = sepIndex === -1 ? '' : keyValue.substring(sepIndex + 1)

      if (key === BOOK_KEY_MARKDOWN) {
        //markdown = value + '\n***\n' + keyValues.slice(i + 1).join('\n***\n')
        markdown = value + '\n\n' + keyValues.slice(i + 1).join('\n\n')
        break
      }

      if (keys.includes(key)) {
        params[key] = value
        continue
      }

      console.warn('BookParser, unknown tag:', key)
    }
    this.validate(params, [BOOK_KEY_TITLE], 'Book: ' + bookId)
    return new Book(bookId, a, markdown, params)
  }

  private validate(data: any, requiredProps: string[], entityName: string): void {
    requiredProps.forEach(p => {
      if (!(p in data)) {
        throw new ParseError(`The required property «${p}» of the «${entityName}» not found in file.`)
      }
    })
  }
}
