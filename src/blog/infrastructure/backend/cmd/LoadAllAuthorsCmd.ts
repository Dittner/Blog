import { type RestApiCmd } from './RestApiCmd'
import { type RestApi } from '../RestApi'
import {
  Author,
  AUTHOR_KEY_BIOGRAPHY,
  AUTHOR_KEY_BIRTH_YEAR,
  AUTHOR_KEY_NAME,
  type AuthorList,
  LoadStatus
} from '../../../domain/BlogModel'

export class LoadAllAuthorsCmd implements RestApiCmd {
  private readonly api: RestApi
  private readonly authorList: AuthorList
  private readonly parser: AuthorParser

  constructor(api: RestApi) {
    this.api = api
    this.authorList = api.context.authorList
    this.parser = new AuthorParser()
  }

  run() {
    if (this.authorList.loadStatus === LoadStatus.PENDING) {
      this.authorList.loadStatus = LoadStatus.LOADING
      this.startLoading().then()
    }
  }

  private async startLoading() {
    const [response, body] = await this.api.sendRequest('GET', '/dirs')
    if (response?.ok) {
      const dict: Record<string, string> = body
      const authors = []
      for (const [authorId, authorData] of Object.entries(dict)) {
        authors.push(this.parser.parse(authorId, authorData))
      }
      this.authorList.authors = authors
      this.authorList.loadStatus = LoadStatus.LOADED
    } else {
      this.authorList.loadStatus = LoadStatus.ERROR
    }
  }
}

class AuthorParser {
  parse(authorsId: string, data: string): Author {
    const keyValues = data.split('\n\n')
    const params: any = {}

    for (let i = 0; i < keyValues.length; i++) {
      const keyValue = keyValues[i]
      const sepIndex = keyValue.indexOf('\n')
      const key = sepIndex === -1 ? keyValue : keyValue.substring(0, sepIndex)
      params[key] = sepIndex === -1 ? '' : keyValue.substring(sepIndex + 1)
    }

    this.validate(params, [AUTHOR_KEY_NAME, AUTHOR_KEY_BIOGRAPHY, AUTHOR_KEY_BIRTH_YEAR], 'Author')
    return new Author(authorsId, params)
  }

  private validate(data: any, requiredProps: string[], entityName: string): void {
    requiredProps.forEach(p => {
      if (!(p in data)) {
        throw new AuthorParseError(`The required property «${p}» of the «${entityName}» not found in file.`)
      }
    })
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
