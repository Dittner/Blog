import {type RestApi, type RestApiError, type Runnable} from '../RestApi'
import {
  type Author,
  Book,
  BOOK_KEY_ABOUT,
  BOOK_KEY_COVER,
  BOOK_KEY_GENRE,
  BOOK_KEY_MARKDOWN,
  BOOK_KEY_TITLE,
  BOOK_KEY_YEAR
} from '../../../domain/BlogModel'
import {type RXObservable, RXOperation} from '../../../../lib/rx/RXPublisher'

export class LoadAllBooksCmd implements Runnable {
  private readonly api: RestApi
  private readonly parser: BookParser
  private readonly author: Author

  constructor(api: RestApi, author: Author) {
    this.api = api
    this.author = author

    this.parser = new BookParser()
  }

  run(): RXObservable<Book[], RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.startLoading(op).catch((e: RestApiError) => { op.fail(e) })
    return op.asObservable
  }

  private async startLoading(op: RXOperation<Book[], RestApiError>) {
    const [response, body] = await this.api.sendRequest('GET', '/dir/' + this.author.id)
    if (response?.ok) {
      const dict: Record<string, string> = body
      const books = []
      for (const [bookId, bookData] of Object.entries(dict)) {
        books.push(this.parser.parse(bookId, bookData, this.author))
      }
      op.success(books)
    } else {
      await this.api.handlerError(response)
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
