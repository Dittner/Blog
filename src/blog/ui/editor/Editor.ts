import { type Page, type User } from '../../domain/BlogModel'
import { type InputProtocol } from 'react-nocss'
import { BlogContext } from '../../BlogContext'
import { RXObservableEntity } from '../../../lib/rx/RXPublisher'

export interface NumberProtocol {
  value: number
}

export class Editor extends RXObservableEntity<Editor> {
  readonly inputTextBuffer: InputProtocol = { value: '' }
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

  //--------------------------------------
  //  isTextReplacing
  //--------------------------------------
  readonly replaceSubstringProtocol: InputProtocol = { value: '' }
  readonly replaceWithProtocol: InputProtocol = { value: '' }
  private _isTextReplacing: boolean = false
  get isTextReplacing(): boolean { return this._isTextReplacing }
  set isTextReplacing(value: boolean) {
    if (this._isTextReplacing !== value) {
      this._isTextReplacing = value
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
    //Ignore TAB key
    if (e.keyCode === 9) {
      e.preventDefault()
      e.stopPropagation()
    }
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
  //  maxEmptyLines
  //--------------------------------------
  readonly maxEmptyLines: NumberProtocol = { value: 3 }

  startFormatting(text: string): string {
    let res = ''

    let blocks = text.replace(/^```code\s*\n(((?!```)(.|\n))+)\n```/gm, '<CODE>$1<CODE>').split('<CODE>')

    blocks.forEach((b, i) => {
      if (i % 2 !== 0) {
        res += '```code\n' + this.replaceQuotes(b) + '\n```'
      } else {
        let blockText = b
        if (i === 0) blockText = this.removeExtraSpacesAtTheBeginning(blockText)
        else if (i === blocks.length - 1) blockText = this.removeExtraSpacesAtTheEnd(blockText)
        blockText = this.removeExtraSpacesInTheMiddle(blockText)
        blockText = this.replaceHyphenWithDash(blockText)
        blockText = this.removeHyphenAndSpace(blockText)
        blockText = this.replaceQuotes(blockText)
        blockText = this.reduceEmptyLines(blockText)
        res += blockText
      }
    })

    console.log('res:', res)
    return res
  }

  removeExtraSpacesAtTheBeginning(s: string): string {
    return s.replace(/^[\n| ]+/, '')
  }

  removeExtraSpacesAtTheEnd(s: string): string {
    return s.replace(/[\n ]+$/, '')
  }

  removeExtraSpacesInTheMiddle(s: string): string {
    return s
      .replace(/\n +/g, '\n')
      .replace(/ +/g, ' ')
      .replace(/ +,/g, ',')
  }

  replaceHyphenWithDash(s: string): string {
    return s
      .replace(/ -- /g, ' — ')
      .replace(/\n-- /g, '\n— ')
      .replace(/([,.])- /g, '$1 — ')
      .replace(/ [-–] /g, ' — ')
  }

  removeHyphenAndSpace(s: string): string {
    return s
      .replace(/^[-–] /gm, '— ')
      .replace(/[-–]$/gm, '—')
      .replaceAll('\n- ', '\n— ')
      .replace(/([А-я])- \n/g, '$1')
  }

  replaceQuotes(s: string): string {
    return s
      .replace(/[”„“«»]/g, '"')
      .replace(/…/g, '...')
  }

  reduceEmptyLines(s: string): string {
    const max = this.maxEmptyLines.value
    return s.replace(new RegExp(`\n{${max},}`, 'g'), '\n'.repeat(max))
  }

  replaceWith(substr: string, replaceValue: string) {
    if (this.user.selectedFile?.isEditing && substr) {
      this.user.selectedFile.replaceWith(substr, replaceValue)
      this.inputTextBuffer.value = this.selectedPage?.text ?? ''
    }
  }
}
