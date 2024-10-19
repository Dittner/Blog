import {generateUID, type UID} from '../../global/domain/UIDGenerator'
import {type File} from '../domain/BlogModel'
import {type RestApi} from './backend/RestApi'
import {RXObservableEntity} from '../../lib/rx/RXPublisher'
import {GlobalContext} from '../../global/GlobalContext'

export class StoreService extends RXObservableEntity<StoreService> {
  readonly uid: UID
  private readonly restApi: RestApi
  private readonly pendingFilesToStore: File[]

  get isStorePending(): boolean {
    return this.pendingFilesToStore.length > 0
  }

  constructor(restApi: RestApi) {
    super()
    this.uid = generateUID()
    this.restApi = restApi
    this.pendingFilesToStore = []
  }

  addToStoreQueue(f: File | undefined) {
    if (f) {
      this.pendingFilesToStore.push(f)
      if (this.pendingFilesToStore.length === 1) {
        this.mutated()
      }
    }
  }

  store() {
    if (this.pendingFilesToStore.length > 0) {
      const hash = new Set<UID>()
      for (const f of this.pendingFilesToStore) {
        if (hash.has(f.id)) continue
        hash.add(f.id)
        this.restApi.storeFile(f).pipe()
          .onReceive(() => { f.id = f.info.id })
          .onError(e => { GlobalContext.self.app.errorMsg = e.message + ', status code: ' + e.statusCode })
          .subscribe()
      }
      this.pendingFilesToStore.length = 0
      this.mutated()
    }
  }
}
