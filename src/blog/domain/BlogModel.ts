import {generateUID, type UID} from '../../global/domain/UIDGenerator'
import {BlogContext} from '../BlogContext'
import {type RestApi, type RestApiError} from '../infrastructure/backend/RestApi'
import {sortByKeys} from '../../global/ui/Utils'
import {GlobalContext} from '../../global/GlobalContext'
import { RXObservable, RXObservableEntity } from 'flinker'

interface Serializable {
  serialize: () => string
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

export class User extends RXObservableEntity<User> {
  readonly uid: UID
  readonly restApi: RestApi
  readonly repo: File

  constructor(restApi: RestApi) {
    super()
    this.uid = generateUID()
    this.restApi = restApi
    this.repo = new File()
    this.repo.deserialize({'isDirectory': 'true', 'text': 'ID\nrepo\n\nNAME\nrepo'})
    console.log('new User')
    console.log('cur location:', document.location)
  }

  //--------------------------------------
  //  selectedFile
  //--------------------------------------
  private _selectedFile: File | undefined = undefined
  get selectedFile(): File | undefined { return this._selectedFile }
  set selectedFile(value: File | undefined) {
    if (this._selectedFile !== value) {
      this._selectedFile && (this._selectedFile.isEditing = false)
      this._selectedFile = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  selectedChapter
  //--------------------------------------
  private _selectedChapter: string = ''
  get selectedChapter(): string { return this._selectedChapter }
  set selectedChapter(value: string) {
    if (this._selectedChapter !== value) {
      this._selectedChapter = value
      this.mutated()
    }
  }

  add(f: File) {
    this.repo.children.push(f)
    this.mutated()
  }

  remove(f: File) {
    const ind = f.parent?.children.indexOf(f) ?? -1
    if (ind !== -1) {
      this.restApi.removeFile(f).pipe()
        .onReceive(() => {
          console.log('User:remove:onReceive')
          f.parent?.children.splice(ind, 1)
          if (this.selectedFile === f) {
            this.selectedFile = undefined
          }
          this.mutated()
        })
    } else {
      console.log('Removing file not found')
    }
  }
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

export const INFO_KEY_ID = 'ID'
export const INFO_KEY_NAME = 'NAME'
export const INFO_KEY_COVER = 'COVER'
export const INFO_KEY_YEAR = 'YEAR'
export const INFO_KEY_GENRE = 'GENRE'
export const INFO_KEY_PHOTO = 'PHOTO'
export const INFO_KEY_ABOUT = 'ABOUT'
export const INFO_KEY_MARKDOWN = 'MARKDOWN'
export const INFO_IS_AUTHOR = 'IS_AUTHOR'
export const INFO_CODE = 'CODE'
export const INFO_AUTHOR_BIRTH_YEAR = 'BIRTH_YEAR'
export const INFO_AUTHOR_DEATH_YEAR = 'DEATH_YEAR'

export class File extends RXObservableEntity<File> {
  uid = generateUID()
  id = ''
  info: InfoPage
  isDamaged = false
  isDirectory = false
  parent: File | undefined = undefined

  get name(): string { return this.info.name }
  get isAuthor(): boolean { return this.info.author !== undefined }
  get link(): string { return this.parent ? this.parent.link + '/' + this.id : this.id }

  constructor() {
    super()
    this.info = new InfoPage(this, '')
    this._pages = []
  }

  deserialize(data: any) {
    try {
      console.log('File: ' + data?.path + ', isDir:', data.isDirectory)
      if (data.text && data.isDirectory !== undefined) {
        this.isDamaged = false
        this.isDirectory = data.isDirectory
        const sepIndex = data.text.indexOf(INFO_KEY_MARKDOWN)
        const infoText = sepIndex === -1 ? data.text : data.text.substring(0, sepIndex).replace(/[\n| ]+$/, '')
        this.info.deserialize(infoText)
        this.id = this.info.id
        const markdown = sepIndex === -1 ? '' : data.text.substring(sepIndex + INFO_KEY_MARKDOWN.length + 1)
        this._pages = markdown ? markdown.split('\n\n\n').map((text: string) => new Page(this, text)) : []
      } else {
        console.log('File:deserialize, isDamaged, data:', data)
        this.isDamaged = true
      }
    } catch (e: any) {
      console.log('File:deserialize, err:', e.message, 'data:', data)
    }
  }

  serialize(): any {
    let text = this.info.serialize()
    if (this.pages.length > 0) {
      text += '\n\n' + INFO_KEY_MARKDOWN + '\n'
      text += this.pages.map(p => p.serialize()).filter(p => p !== '').join('\n\n\n')
    }
    return {id: this.info.id, text}
  }

  static compare = (a: File, b: File) => {
    if (a.info.year > b.info.year) return -1
    if (a.info.year < b.info.year) return 1
    return 0
  }

  //--------------------------------------
  //  isEditing
  //--------------------------------------
  private _isEditing: boolean = false
  get isEditing(): boolean { return this._isEditing }
  set isEditing(value: boolean) {
    if (this._isEditing !== value) {
      this._isEditing = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  filesLoaded
  //--------------------------------------
  private _filesLoaded: boolean = false
  get filesLoaded(): boolean { return this._filesLoaded }
  set filesLoaded(value: boolean) {
    if (this._filesLoaded !== value) {
      this._filesLoaded = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  children
  //--------------------------------------
  private _children: File[] = []
  get children(): File[] { return this._children }
  set children(value: File[]) {
    if (this._children !== value) {
      this._children = value.sort(sortByKeys(['isDirectory', 'isAuthor', 'name'], [false, true]))
      this._children.forEach(f => f.parent = this)
      this.parent?.mutated()
      this.mutated()
    }
  }

  //--------------------------------------
  //  pages
  //--------------------------------------
  private _pages: Page[]
  get pages(): Page[] { return this._pages }

  //--------------------------------------
  //  isLoading
  //--------------------------------------
  private _isLoading: boolean = false
  get isLoading(): boolean { return this._isLoading }
  set isLoading(value: boolean) {
    if (this._isLoading !== value) {
      this._isLoading = value
      this.mutated()
    }
  }

  private op: RXObservable<any[], RestApiError> | undefined
  loadChildrenFiles(): RXObservable<any[], RestApiError> {
    if (this.op && !this.op.isComplete) return this.op
    const op = BlogContext.self.restApi.loadChildrenFiles(this)
    this.op = op
    this.isLoading = true

    op.pipe()
      .onReceive((files: any) => {
        console.log('File:loadChildrenFiles:onReceive, files count:', files.length)

        this.children = files.map((data: any) => {
          const f = new File()
          f.deserialize(data)
          return f
        })
          .filter((f: File) => !f.isDamaged)
        console.log('----after parsing:', this.children)
      })
      .onComplete(() => {
        this.filesLoaded = true
        this.isLoading = false
      })
      .subscribe()

    return op
  }

  createAndAddFile(): File | undefined {
    if (!this.isDirectory) return undefined

    const id = generateUID()
    let text = INFO_KEY_ID + '\n' + id + '\n\n'
    text += INFO_KEY_NAME + '\n' + id + '\n\n'
    text += INFO_KEY_GENRE + '\n' + 'philosophy | literature | movie | science | art | memoirs\n\n'
    text += INFO_KEY_YEAR + '\n' + (new Date()).getFullYear() + '\n\n'
    text += INFO_CODE + '\nfalse\n\n'
    text += INFO_KEY_ABOUT + '\n' + 'Description'

    const res = new File()
    res.deserialize({'isDirectory': false, text})
    this.addFile(res)
    const rx = BlogContext.self.restApi.storeFile(res)
    rx.pipe()
      .onError((e:any) => {
        this.removeFile(res)
        GlobalContext.self.app.errorMsg = e.message
      })
      .subscribe()
    return res
  }

  createAndAddDirectory(): File | undefined {
    if (!this.isDirectory) return undefined

    const id = generateUID()
    let text = INFO_KEY_ID + '\n' + id + '\n\n'
    text += INFO_KEY_NAME + '\n' + id + '\n\n'
    text += INFO_IS_AUTHOR + '\nfalse\n\n'
    text += INFO_AUTHOR_BIRTH_YEAR + '\n1900\n\n'
    text += INFO_AUTHOR_DEATH_YEAR + '\n2000\n\n'
    text += INFO_KEY_PHOTO + '\n/repo/ID/img/photo.png\n\n'
    text += INFO_KEY_ABOUT + '\nBiography'

    const res = new File()
    res._filesLoaded = true
    res.deserialize({'isDirectory': true, text})
    this.addFile(res)
    const rx = BlogContext.self.restApi.storeFile(res)
    rx.pipe()
      .onError((e:any) => {
        this.removeFile(res)
        GlobalContext.self.app.errorMsg = e.message
      })
      .subscribe()
    return res
  }

  removeFile(f: File) {
    const ind = this.children.indexOf(f)
    if (ind !== -1) {
      this.children.splice(ind, 1)
      this.mutated()
    }
  }

  addFile(f: File) {
    if (this.isDirectory) {
      this.children.push(f)
      f.parent = this
      this.mutated()
    }
  }

  createPage(atIndex: number = 0): Page {
    const p = new Page(this, '')
    if (atIndex === 0) {
      this.pages.unshift(p)
    } else if (atIndex >= this._pages.length) {
      this.pages.push(p)
    } else {
      this._pages = [...this._pages.slice(0, atIndex), p, ...this._pages.slice(atIndex)]
    }
    this.mutated()
    this.store()
    return p
  }

  movePageUp(page: Page): boolean {
    if (page === this.info) return false
    const pageInd = this.pages.findIndex(p => p.uid === page.uid)
    if (pageInd !== -1 && pageInd !== 0) {
      this.pages[pageInd] = this.pages[pageInd - 1]
      this.pages[pageInd - 1] = page
      this.mutated()
      this.store()
      return true
    }
    return false
  }

  movePageDown(page: Page): boolean {
    if (page === this.info) return false
    const pageInd = this.pages.findIndex(p => p.uid === page.uid)
    if (pageInd !== -1 && pageInd < this.pages.length - 1) {
      this.pages[pageInd] = this.pages[pageInd + 1]
      this.pages[pageInd + 1] = page
      this.mutated()
      this.store()
      return true
    }
    return false
  }

  remove(page: Page): boolean {
    if (page === this.info) return false
    const pageInd = this.pages.findIndex(p => p.uid === page.uid)
    if (pageInd !== -1) {
      this.pages.splice(pageInd, 1)
      page.dispose()
      this.mutated()
      this.store()
      return true
    }
    return false
  }

  replaceWith(substr: string, replaceValue: string) {
    if (!substr) return

    this.pages.forEach(p => {
      let res = p.text

      res = res.replace(new RegExp(substr, "g"), replaceValue)
      res = res.replace(/\\n/g, '\n')
      p.text = res
    })
  }

  private store() {
    BlogContext.self.storeService.addToStoreQueue(this)
  }

  dispose() {
    super.dispose()
    this.pages.forEach(b => {
      b.dispose()
    })
    this._pages = []
  }
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

export class Page extends RXObservableEntity<Page> implements Serializable {
  readonly uid = generateUID()
  readonly file: File

  constructor(file: File, text: string) {
    super()
    this.file = file
    this._text = text
  }

  //--------------------------------------
  //  movable
  //--------------------------------------
  protected _movable = true
  get movable(): boolean { return this._movable }

  //--------------------------------------
  //  removable
  //--------------------------------------
  protected _removable = true
  get removable(): boolean { return this._removable }

  //--------------------------------------
  //  text
  //--------------------------------------
  protected _text: string = ''
  get text(): string { return this._text }
  set text(value: string) {
    if (this._text !== value) {
      this._text = value
      this.mutated()
      this.textDidChange()
      BlogContext.self.storeService.addToStoreQueue(this.file)
    }
  }

  //--------------------------------------
  //  isSelected
  //--------------------------------------
  private _isSelected: boolean = false
  get isSelected(): boolean { return this._isSelected }
  set isSelected(value: boolean) {
    if (this._isSelected !== value) {
      this._isSelected = value
      this.mutated()
    }
  }

  protected textDidChange() {}

  serialize(): string {
    return this._text
  }

  dispose() {
    super.dispose()
  }
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

export class InfoPage extends Page {
  constructor(file: File, text: string) {
    super(file, text)
    this.deserialize(text)
    this._movable = false
    this._removable = false
  }

  protected override textDidChange() {
    this.deserialize(this.text)
  }

  //--------------------------------------
  //  id
  //--------------------------------------
  private _id: string = ''
  get id(): string { return this._id }

  //--------------------------------------
  //  name
  //--------------------------------------
  private _name: string = ''
  get name(): string { return this._name }

  //--------------------------------------
  //  year
  //--------------------------------------
  private _year: string = ''
  get year(): string { return this._year }

  //--------------------------------------
  //  isCode
  //--------------------------------------
  private _isCode: boolean = false
  get isCode(): boolean { return this._isCode }

  //--------------------------------------
  //  genre: movie | philosophy | literature | science | art | memoirs
  //--------------------------------------
  private _genre: string = ''
  get genre(): string { return this._genre }

  //--------------------------------------
  //  about
  //--------------------------------------
  private _about: string = ''
  get about(): string { return this._about }

  //--------------------------------------
  //  photo
  //--------------------------------------
  private _photo: string = ''
  get photo(): string { return this._photo }

  //--------------------------------------
  //  cover
  //--------------------------------------
  private _cover: string = ''
  get cover(): string { return this._cover }

  //--------------------------------------
  //  author
  //--------------------------------------
  private _author: Author | undefined = undefined
  get author(): Author | undefined { return this._author }

  deserialize(text: string) {
    const keyValues = text.replace(/\n{3,}/g, '\n\n').split('\n\n')
    this._text = text
    let isAuthor = false
    let authorBirthYear = ''
    let authorDeathYear = ''

    const aboutIndex = text.indexOf(INFO_KEY_ABOUT + '\n')
    this._about = aboutIndex === -1 ? '' : text.substring(aboutIndex + INFO_KEY_ABOUT.length + 1)
    

    for (let i = 0; i < keyValues.length; i++) {
      const keyValue = keyValues[i]
      const sepIndex = keyValue.indexOf('\n')
      const key = sepIndex === -1 ? keyValue : keyValue.substring(0, sepIndex)
      const value = sepIndex === -1 ? '' : keyValue.substring(sepIndex + 1)

      if (!key) continue

      if (key === INFO_KEY_ID) { 
        this._id = value
      } else if (key === INFO_KEY_NAME) {
        this._name = value
      } else if (key === INFO_IS_AUTHOR) {
        isAuthor = value.toLowerCase() === 'true'
      } else if (key === INFO_CODE) {
        this._isCode = value.toLowerCase() === 'true'
      } else if (key === INFO_AUTHOR_BIRTH_YEAR) {
        authorBirthYear = value
      } else if (key === INFO_AUTHOR_DEATH_YEAR) {
        authorDeathYear = value
      } else if (key === INFO_KEY_COVER) {
        this._cover = value
      } else if (key === INFO_KEY_YEAR) {
        this._year = value
      } else if (key === INFO_KEY_PHOTO) {
        this._photo = value
      } else if (key === INFO_KEY_ABOUT) {
        break
      } else if (key === INFO_KEY_GENRE) {
        this._genre = value
      } else {
        console.warn('InfoPage:deserialize, unknown tag:', key, ', keyValues:')
        console.warn(keyValues)
      }
    }

    this._author = isAuthor ? new Author(this.name, authorBirthYear, authorDeathYear) : undefined

    if (this._name === '') this._name = 'Title'
  }
}

export class Author {
  readonly birthYear: string
  readonly deathYear: string
  readonly fullName: string
  readonly shortName: string

  constructor(name: string, birthYear: string, deathYear: string) {
    this.fullName = name
    const [surName, ...rest] = name.split(' ')
    this.shortName = rest.length > 0 ? surName + ' ' + rest.map(v => v.charAt(0).toLocaleUpperCase() + '.').join('') : surName
    this.birthYear = birthYear
    this.deathYear = deathYear
  }
}
