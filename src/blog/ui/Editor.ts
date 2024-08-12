import {type Page, type User} from '../domain/BlogModel'
import {type InputProtocol} from 'react-nocss'
import {BlogContext} from '../BlogContext'
import {RXObservableEntity} from '../../lib/rx/RXPublisher'

export interface NumberProtocol {
  value: number
}

export class Editor extends RXObservableEntity<Editor> {
  readonly inputTextBuffer: InputProtocol = {value: ''}
  private readonly user: User

  //--------------------------------------
  //  editMode
  //--------------------------------------
  private _editMode: boolean = false
  get editMode(): boolean { return this._editMode }
  set editMode(value: boolean) {
    if (this._editMode !== value) {
      this._editMode = value
      this.selectedPage = undefined
      this.mutated()
    }
  }

  //--------------------------------------
  //  selectedPage
  //--------------------------------------
  private _selectedPage: Page | undefined = undefined
  get selectedPage(): Page | undefined { return this._selectedPage }
  set selectedPage(value: Page | undefined) {
    if (this._selectedPage !== value) {
      this.applyTextChanges()
      this._selectedPage = value
      this.inputTextBuffer.value = this._selectedPage?.text ?? ''
      this.mutated()
    }
  }

  constructor(user: User) {
    super()
    this.user = user
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
        BlogContext.self.repo.store()
      }
      //Ctrl + Shift + E
      else if (e.keyCode === 69) {
        e.preventDefault()
        e.stopPropagation()
        this.toggleEditMode()
      }
      //Ctrl + Shift + F
      else if (this.editMode && e.keyCode === 70) {
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
    if (this.editMode && this.user.selectedBook) {
      const b = this.user.selectedBook
      if (this.selectedPage) {
        const curPageIndex = b.pages.findIndex(p => p.uid === this.selectedPage?.uid)
        this.selectedPage = (b.createPage(curPageIndex + 1))
      } else {
        this.selectedPage = b.createPage(b.pages.length)
      }
      window.scroll(0, document.documentElement.scrollHeight)
    }
  }

  movePageUp() {
    if (this.editMode && this.selectedPage) {
      this.selectedPage?.book?.movePageUp(this.selectedPage)
    }
  }

  movePageDown() {
    if (this.editMode && this.selectedPage?.book) {
      this.selectedPage?.book.movePageDown(this.selectedPage)
    }
  }

  deletePage() {
    if (this.editMode && this.selectedPage) {
      console.log('---Deleting page!')
      this.selectedPage?.book?.remove(this.selectedPage)
      this.selectedPage = undefined
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode
  }

  private _timeoutID: any = undefined
  inputTextChanged() {
    console.log('Editor::updatePageText')
    if (!this._timeoutID) {
      this._timeoutID = setTimeout(() => {
        this.applyTextChanges()
      }, 2000)
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
  private _removeDuplicateSpaces: boolean = true
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
      res = res.replaceAll('-\n', '—\n')
      res = res.replace(/([А-я])- /g, '$1')
    }

    if (this.replaceHyphenWithDash) {
      res = res.replace(/ - /g, ' — ')
      res = res.replace(/ – /g, ' — ')
    }

    const max = this.maxEmptyLines.value
    res = res.replace(new RegExp(`\n{${max},}`, 'g'), '\n'.repeat(max))

    return res
  }
}
