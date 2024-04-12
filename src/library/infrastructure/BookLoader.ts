import {
  type Author,
  AuthorLoadStatus,
  Book, BOOK_KEY_ABOUT, BOOK_KEY_MARKDOWN,
  BOOK_KEY_TITLE, BOOK_KEY_YEAR
} from '../domain/LibraryModel'

export class BookLoader {
  private readonly parser: BookParser

  constructor() {
    this.parser = new BookParser()
  }

  readonly loadAllBooks = async(a: Author) => {
    if (a.booksId.length === 0) {
      return
    }

    if (a.booksLoadStatus !== AuthorLoadStatus.PENDING) return
    a.booksLoadStatus = AuthorLoadStatus.LOADING
    for (let i = 0; i < a.booksId.length; i++) {
      const bookId = a.booksId[i]
      if (bookId) {
        await this.loadBook(a, bookId)
      }
    }

    a.booksLoadStatus = AuthorLoadStatus.LOADED
  }

  readonly loadBook = async(a: Author, bookId: string) => {
    const url = '/library/' + a.uid + '/' + bookId + '.txt'
    if (a.books.find(b => b.id === bookId)) return
    const response = await fetch(url)

    if (response.ok) {
      const data = await response.text()
      if (data) {
        try {
          const res = this.parser.parse(data, bookId, a, url)
          a.books.push(res)
        } catch (e: any) {
          console.error(e)
        }
      } else {
        console.warn('The file is not found, url: ' + url)
      }
    } else {
      const msg = `BookLoader.loadBook: An error has occurred: ${response.status}`
      console.warn(msg)
      //throw new Error(message)
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
  parse(data: string, bookId: string, a: Author, url: string): Book {
    console.log('BookParser, author: ' + a.fullName + ', bookId: ' + bookId)
    const keyValues = data.split('\n\n')
    const params: any = {}
    let markdown = ''

    for (let i = 0; i < keyValues.length; i++) {
      const keyValue = keyValues[i]
      const sepIndex = keyValue.indexOf('\n')
      const key = sepIndex === -1 ? keyValue : keyValue.substring(0, sepIndex)
      const value = sepIndex === -1 ? '' : keyValue.substring(sepIndex + 1)

      if (key === BOOK_KEY_MARKDOWN) {
        markdown = value + '\n***\n' + keyValues.slice(i + 1).join('\n***\n')
        break
      }

      if (key === BOOK_KEY_TITLE) {
        params[key] = value
        continue
      }

      if (key === BOOK_KEY_YEAR) {
        params[key] = value
        continue
      }

      if (key === BOOK_KEY_ABOUT) {
        params[key] = value
        continue
      }

      console.warn('BookParser, unknown tag:', key)
    }
    this.validate(params, [BOOK_KEY_TITLE], 'Book: ' + url)
    return new Book(bookId, url, a.uid, markdown, params)
  }

  private validate(data: any, requiredProps: string[], entityName: string): void {
    requiredProps.forEach(p => {
      if (!(p in data)) {
        throw new ParseError(`The required property «${p}» of the «${entityName}» not found in file.`)
      }
    })
  }
}
