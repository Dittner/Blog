import {type RestApi, type RestApiError, type Runnable} from '../RestApi'
import {type File} from '../../../domain/BlogModel'
import {type RXObservable, RXOperation} from 'flinker'

export class RemoveFileCmd implements Runnable {
  private readonly api: RestApi
  private readonly file: File

  constructor(api: RestApi, f: File) {
    this.api = api
    this.file = f
  }

  run(): RXObservable<any, RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.store(op).catch((e: RestApiError) => { op.fail(e) })
    return op.asObservable
  }

  private async store(op: RXOperation<any, RestApiError>) {
    const file = this.file
    const path = file.isDirectory ? '/file/' + file.link : '/file/' + file.link + '.txt'
    const [response, _] = await this.api.sendRequest('DELETE', path)
    if (response?.ok) {
      op.success('ok')
    } else {
      await this.api.handlerError(response)
    }
  }
}
