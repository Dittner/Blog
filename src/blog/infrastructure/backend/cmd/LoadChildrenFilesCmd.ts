import {type RestApi, type RestApiError, type Runnable} from '../RestApi'
import {type File} from '../../../domain/BlogModel'
import {type RXObservable, RXOperation} from '../../../../lib/rx/RXPublisher'

export class LoadChildrenFilesCmd implements Runnable {
  private readonly api: RestApi
  private readonly directory: File

  constructor(api: RestApi, directory: File) {
    this.api = api
    this.directory = directory
  }

  run(): RXObservable<any, RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.startLoading(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op.asObservable
  }

  private async startLoading(op: RXOperation<File[], RestApiError>) {
    console.log('LoadSubdirectoriesAndFilesCmd:startLoading, dir link:', this.directory.link)
    const path = this.directory.link ? '/dir/' + this.directory.link : '/dir'
    const [response, body] = await this.api.sendRequest('GET', path)
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
