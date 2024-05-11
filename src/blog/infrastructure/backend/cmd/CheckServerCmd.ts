import { type RestApiCmd } from './RestApiCmd'
import { type RestApi } from '../RestApi'

export class CheckServerCmd implements RestApiCmd {
  private readonly api: RestApi

  constructor(api: RestApi) {
    this.api = api
  }

  run() {
    console.log('CheckServerCmd, running...')
    this.sendRequest().then()
  }

  private async sendRequest() {
    const [response, _] = await this.api.sendRequest('GET', '')
    console.log('CheckServerCmd, isServerReady: ', response?.ok)
    this.api.isServerRunning = response?.ok ?? false
  }
}
