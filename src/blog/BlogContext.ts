import {type File, User} from './domain/BlogModel'
import {BlogMenu} from './ui/menu/BlogMenu'
import {Editor} from './ui/editor/Editor'
import {StoreService} from './infrastructure/StoreService'
import {RestApi} from './infrastructure/backend/RestApi'
import {GlobalContext} from '../global/GlobalContext'
import {observe} from 'flinker-react'

export class BlogContext {
  readonly user: User
  readonly directoriesUID: string[]
  readonly blogMenu: BlogMenu
  readonly editor: Editor
  readonly restApi: RestApi
  readonly storeService: StoreService

  static self: BlogContext

  static init() {
    if (BlogContext.self === undefined) {
      BlogContext.self = new BlogContext()
      BlogContext.self.subscribeToBrowserLocation()
    }
    return BlogContext.self
  }

  private constructor() {
    this.directoriesUID = []
    this.restApi = new RestApi()
    this.user = new User(this.restApi)
    this.blogMenu = new BlogMenu()
    this.editor = new Editor(this.user)
    this.storeService = new StoreService(this.restApi)
  }

  private subscribeToBrowserLocation() {
    GlobalContext.self.app.pipe()
      .onReceive(_ => {
        this.parseBrowserLocation()
      })
      .subscribe()
  }

  private parseBrowserLocation() {
    const path = document.location.pathname //'/directoryId/fileId#hash'
    const selectedChapter = document.location.hash //hash
    const vv = path.split(/[/\#]/) //[ 'repo', 'directoryId', 'fileId', 'hash' ]

    if (vv[vv.length - 1] === selectedChapter) {
      vv.pop()
    }

    let selectedFile: File = this.user.repo
    while (vv.length > 0) {
      const id = vv.shift()
      const files: File[] = selectedFile?.children ?? []
      for (let i = 0; i < files.length; i++) {
        if (files[i].id === id) {
          selectedFile = files[i]
          break
        }
      }

      if (selectedFile.isDirectory) {
        if (!selectedFile.filesLoaded) {
          selectedFile.loadChildrenFiles().pipe()
            .onComplete(() => {
              this.parseBrowserLocation()
            })
            .subscribe()
          break
        }
      } else {
        break
      }
    }
    console.log('BlogContext:parseBrowserLocation, path:', path, ', root children:', this.user.repo.children.length, ', selectedFle:', selectedFile)

    this.user.selectedFile = selectedFile
    this.user.selectedChapter = selectedChapter
  }
}

export function observeEditor(): Editor {
  return observe(BlogContext.self.editor)
}

export function observeStoreService(): StoreService {
  return observe(BlogContext.self.storeService)
}

export function observeApi(): RestApi {
  return observe(BlogContext.self.restApi)
}

export function observeUser(): User {
  return observe(BlogContext.self.user)
}

export function observeBlogMenu(): BlogMenu {
  return observe(BlogContext.self.blogMenu)
}
