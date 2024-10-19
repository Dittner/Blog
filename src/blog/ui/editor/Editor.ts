import {type Page, type User} from '../../domain/BlogModel'
import {type InputProtocol} from 'react-nocss'
import {BlogContext} from '../../BlogContext'
import {RXObservableEntity} from '../../../lib/rx/RXPublisher'

export interface NumberProtocol {
  value: number
}

export class Editor extends RXObservableEntity<Editor> {
  readonly inputTextBuffer: InputProtocol = {value: ''}
  private readonly user: User

  //--------------------------------------
  //  selectedPage
  //--------------------------------------
  private _selectedPage: Page | undefined = undefined
  get selectedPage(): Page | undefined { return this._selectedPage }
  set selectedPage(value: Page | undefined) {
    if (this._selectedPage !== value) {
      this.applyTextChanges()
      if (this._selectedPage) this._selectedPage.isSelected = false
      this._selectedPage = value
      if (value) value.isSelected = true
      this.inputTextBuffer.value = this._selectedPage?.text ?? ''
      console.log('Editor:selectedPage:', value)
      this.mutated()
    }
  }

  constructor(user: User) {
    super()
    this.user = user
    user.pipe()
      .map(u => u.selectedFile)
      .removeDuplicates()
      .onReceive((f) => this.selectedPage = f?.info)
      .subscribe()

    user.pipe()
      .map(u => u.selectedFile)
      .skipNullable()
      .flatMap(f => f)
      .map(f => f.isEditing)
      .removeDuplicates()
      .onReceive((isEditing) => {
        !isEditing && this.applyTextChanges()
      })
      .subscribe()
    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  private onKeyDown(e: KeyboardEvent) {
    //Ctrl + Shift + P
    //console.log('Ctrl + Shift + ', e.keyCode)
    if (e.ctrlKey && e.shiftKey) {
      //Ctrl + Shift + P
      if (e.keyCode === 80) {
        e.preventDefault()
        e.stopPropagation()
        this.createPage()
      }
      //Ctrl + Shift + S
      else if (e.keyCode === 83) {
        e.preventDefault()
        e.stopPropagation()
        BlogContext.self.storeService.store()
      }
      //Ctrl + Shift + E
      else if (e.keyCode === 69) {
        if (this.user.selectedFile) {
          this.user.selectedFile.isEditing = !this.user.selectedFile.isEditing
        }
        e.preventDefault()
        e.stopPropagation()
      }
      //Ctrl + Shift + F
      else if (this.user.selectedFile?.isEditing && e.keyCode === 70) {
        e.preventDefault()
        e.stopPropagation()
        const text = this.startFormatting(this.inputTextBuffer.value)
        if (this.inputTextBuffer.value !== text) {
          this.inputTextBuffer.value = text
          this.mutated()
        }
      }
    }
  }

  //--------------------------------------
  //  create, move page
  //--------------------------------------

  createPage() {
    if (this.user.selectedFile?.isEditing) {
      const f = this.user.selectedFile
      if (this.selectedPage) {
        const curPageIndex = f.pages.findIndex(p => p.uid === this.selectedPage?.uid)
        this.selectedPage = (f.createPage(curPageIndex + 1))
      } else {
        this.selectedPage = f.createPage(f.pages.length)
        window.scroll(0, document.documentElement.scrollHeight)
      }
    }
  }

  movePageUp() {
    if (this.user.selectedFile?.isEditing && this.selectedPage) {
      this.selectedPage?.file?.movePageUp(this.selectedPage)
    }
  }

  movePageDown() {
    if (this.user.selectedFile?.isEditing && this.selectedPage?.file) {
      this.selectedPage?.file.movePageDown(this.selectedPage)
    }
  }

  deletePage() {
    console.log('---Deleting page!')
    if (this.user.selectedFile?.isEditing && this.selectedPage && this.selectedPage?.file?.remove(this.selectedPage)) {
      this.selectedPage = undefined
    }
  }

  private _timeoutID: any = undefined
  inputTextChanged() {
    console.log('Editor::updatePageText')
    if (!this._timeoutID) {
      this._timeoutID = setTimeout(() => {
        this.applyTextChanges()
      }, 100)
    }
  }

  private applyTextChanges() {
    if (this.selectedPage) {
      this.selectedPage.text = this.startFormatting(this.inputTextBuffer.value)
      if (this._timeoutID) {
        clearTimeout(this._timeoutID)
        this._timeoutID = undefined
      }
    }
  }

  //--------------------------------------
  //  removeDuplicateSpaces
  //--------------------------------------
  private _removeDuplicateSpaces: boolean = false
  get removeDuplicateSpaces(): boolean { return this._removeDuplicateSpaces }
  set removeDuplicateSpaces(value: boolean) {
    if (this._removeDuplicateSpaces !== value) {
      this._removeDuplicateSpaces = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  removeHyphenAndSpace
  //--------------------------------------
  private _removeHyphenAndSpace: boolean = true
  get removeHyphenAndSpace(): boolean { return this._removeHyphenAndSpace }
  set removeHyphenAndSpace(value: boolean) {
    if (this._removeHyphenAndSpace !== value) {
      this._removeHyphenAndSpace = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  replaceHyphenWithDash
  //--------------------------------------
  private _replaceHyphenWithDash: boolean = true
  get replaceHyphenWithDash(): boolean { return this._replaceHyphenWithDash }
  set replaceHyphenWithDash(value: boolean) {
    if (this._replaceHyphenWithDash !== value) {
      this._replaceHyphenWithDash = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  maxEmptyLines
  //--------------------------------------
  readonly maxEmptyLines: NumberProtocol = {value: 3}

  startFormatting(text: string): string {
    let res = text

    if (this.removeDuplicateSpaces) {
      //remove new lines and spaces at the beginning of the text
      res = res.replace(/^[\n| ]+/, '')
      //remove new lines and spaces at the end of the text
      res = res.replace(/[\n| ]+$/, '')
      //remove spaces at the beginning of line
      res = res.replace(/\n +/g, '\n')
      res = res.replace(/ +/g, ' ')
      res = res.replace(/ +,/g, ',')
    }

    if (this.removeHyphenAndSpace) {
      res = res.replace(/^-/, '—')
      res = res.replace(/-$/, '—')
      res = res.replaceAll('\n-', '\n—')
      //res = res.replaceAll('-\n', '—\n')
      res = res.replace(/([А-я])- /g, '$1')
    }

    if (this.replaceHyphenWithDash) {
      res = res.replace(/ -- /g, ' — ')
      res = res.replace(/ - /g, ' — ')
      res = res.replace(/ – /g, ' — ')
    }

    const max = this.maxEmptyLines.value
    res = res.replace(new RegExp(`\n{${max},}`, 'g'), '\n'.repeat(max))

    return res
  }
}
