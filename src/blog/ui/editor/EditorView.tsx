import { observer } from '../../../lib/rx/RXObserver'
import { buildClassName, HStack, Label, Spacer, VStack, type StackProps, type StylableComponentProps, type TextAreaProps } from 'react-nocss'
import { observeEditor } from '../../BlogContext'
import { type GlobalTheme, themeManager } from '../../../global/application/ThemeManager'
import { LayoutLayer } from '../../../global/application/Application'
import React, { useEffect, useRef, useState } from 'react'
import { useWindowSize } from '../../../App'
import { InputForm } from '../../../global/ui/Input'
import { TextButton } from '../../../global/ui/Button'
import { MultilineLabel } from '../../../global/ui/Text'

export const EditorView = observer((props: StackProps) => {
  console.log('new EditorView')
  const editor = observeEditor()
  const theme = themeManager.theme

  return <HStack
    halign="left"
    valign="top"
    gap="0"
    bgColor={theme.appBg}
    borderRight={['1px', 'solid', theme.text + '20']}
    borderColor={theme.transparent}
    layer={LayoutLayer.ONE}
    position='fixed' left='0' top='0'
    {...props}>

    {editor.selectedPage && !editor.isTextReplacing &&
      <TextEditor
        className='article listScrollbar'
        protocol={editor.inputTextBuffer}
        onChange={_ => {
          editor.inputTextChanged()
        }}
        disabled={!editor.selectedPage}
        disableHorizontalScroll
        width='100%' height='100%'
        textAlign='left'
        textColor={theme.editorText}
        borderColor='undefined'
        fontSize={theme.defFontSize}
        caretColor={theme.isLight ? '#000000' : theme.red}
        bgColor={theme.appBg}
        paddingHorizontal="40px"
        keepFocus
        autoFocus />
    }

    {editor.selectedPage && editor.isTextReplacing &&
      <ReplaceWithView width='100%' height='100%' />

    }
  </HStack>
})

/*
*
* TextEditor
*
* */

class TextEditorController {
  static scrollToCursor(ta: HTMLTextAreaElement) {
    ta.blur()
    ta.focus()
  }

  static newLine(ta: HTMLTextAreaElement) {
    const value = ta.value
    const selectionStart = ta.selectionStart

    let beginRowIndex = value.lastIndexOf('\n', selectionStart - 1)
    beginRowIndex = beginRowIndex !== -1 ? beginRowIndex + 1 : 0

    const row = value.slice(beginRowIndex, selectionStart)
    const beginRowSpaces = TextEditorController.calcSpaceBefore(row)
    const endRowSpaces = /(:|\(|\{) *$/.test(row) ? 4 : 0
    //console.log('Row:' + 'BEGIN' + row + 'END, beginRowSpaces:', beginRowSpaces)

    const spaces = '\n' + ' '.repeat(beginRowSpaces + endRowSpaces)
    // func setRangeText unfortunately clears browser history
    // ta.current.setRangeText(spaces, selectionStart, selectionStart, 'end')
    document.execCommand('insertText', false, spaces)
    TextEditorController.scrollToCursor(ta)
  }

  static calcSpaceBefore(row: string): number {
    if (!row) return 0
    for (let i = 0; i < row.length; i++) {
      if (row.charAt(i) !== ' ') {
        return i
      }
    }
    return row.length
  }

  static adjustScroller(ta: HTMLTextAreaElement) {
    ta.style.height = 'inherit'
    ta.style.height = `${ta.scrollHeight + 5}px`
  }

  static moveCursorToEndLine(ta: HTMLTextAreaElement) {
    const endOfTheLineIndex = ta.value.indexOf('\n', ta.selectionStart)
    if (endOfTheLineIndex !== -1) {
      ta.setSelectionRange(endOfTheLineIndex, endOfTheLineIndex)
    } else {
      ta.setSelectionRange(ta.value.length, ta.value.length)
    }
  }

  static moveCursorToBeginLine(ta: HTMLTextAreaElement) {
    let beginOfTheLineIndex = ta.value.lastIndexOf('\n', ta.selectionStart - 1)
    if (beginOfTheLineIndex !== -1) {
      for (let i = beginOfTheLineIndex + 1; i < ta.value.length; i++) {
        if (ta.value.at(i) !== ' ') {
          beginOfTheLineIndex = i
          break
        }
      }
      ta.setSelectionRange(beginOfTheLineIndex, beginOfTheLineIndex)
    } else {
      ta.setSelectionRange(0, 0)
    }
  }

  static removeSentenceUnderCursor(ta: HTMLTextAreaElement) {
    let beginOfTheLineIndex = ta.value.lastIndexOf('\n', ta.selectionStart - 1)
    if (beginOfTheLineIndex === -1) beginOfTheLineIndex = 0
    let endOfTheLineIndex = ta.value.indexOf('\n', ta.selectionStart)
    if (endOfTheLineIndex === -1) endOfTheLineIndex = ta.value.length

    ta.setSelectionRange(beginOfTheLineIndex, endOfTheLineIndex)
    document.execCommand('insertText', false, '')
    ta.setSelectionRange(beginOfTheLineIndex, endOfTheLineIndex)

    if (beginOfTheLineIndex < ta.value.length - 1) beginOfTheLineIndex++
    ta.setSelectionRange(beginOfTheLineIndex, beginOfTheLineIndex)
    this.moveCursorToEndLine(ta)
  }

  static uppercase(ta: HTMLTextAreaElement) {
    try {
      if (ta.selectionStart === ta.selectionEnd) return
      let text = ta.value.slice(ta.selectionStart, ta.selectionEnd)
      document.execCommand('insertText', false, text.toUpperCase())
    } catch (e) {
      console.log('TextEditorController:uppercase: ', e)
    }
  }

  static removeNewLines(ta: HTMLTextAreaElement) {
    try {
      if (ta.selectionStart === ta.selectionEnd) return
      let text = ta.value.slice(ta.selectionStart, ta.selectionEnd)
      text = text.replace(/[-–—]\n/g, '')
      text = text.replace(/\n/g, ' ').replace('  ', ' ')
      document.execCommand('insertText', false, text)
    } catch (e) {
      console.log('TextEditorController:removeNewLines: ', e)
    }
  }

  static duplicateLine(ta: HTMLTextAreaElement) {
    let beginOfTheLineIndex = ta.value.lastIndexOf('\n', ta.selectionStart - 1)
    if (beginOfTheLineIndex === -1) beginOfTheLineIndex = 0
    let endOfTheLineIndex = ta.value.indexOf('\n', ta.selectionStart)
    if (endOfTheLineIndex === -1) endOfTheLineIndex = ta.value.length
    //console.log('TextEditorController:duplicateLine, range:', beginOfTheLineIndex, endOfTheLineIndex)

    const line = beginOfTheLineIndex === 0 ?
      '\n' + ta.value.slice(beginOfTheLineIndex, endOfTheLineIndex) :
      ta.value.slice(beginOfTheLineIndex, endOfTheLineIndex)

    if (!line) return

    ta.setSelectionRange(endOfTheLineIndex, endOfTheLineIndex)
    document.execCommand('insertText', false, line)
  }

  static tabulate(ta: HTMLTextAreaElement) {
    document.execCommand('insertText', false, '    ')
  }

  static lowercase(ta: HTMLTextAreaElement) {
    try {
      if (ta.selectionStart === ta.selectionEnd) return
      let text = ta.value.slice(ta.selectionStart, ta.selectionEnd)
      document.execCommand('insertText', false, text.toLowerCase())
    } catch (e) {
      console.log('TextEditorController:lowercase: ', e)
    }
  }

  static wrapAsMultilineCode(ta: HTMLTextAreaElement) {
    try {
      if (ta.selectionStart === ta.selectionEnd) {
        document.execCommand('insertText', false, '```\n```')
        ta.setSelectionRange(ta.selectionStart - 4, ta.selectionStart - 4)
        return
      }
      let selectionStart = ta.selectionStart
      let text = ta.value.slice(ta.selectionStart, ta.selectionEnd)
      document.execCommand('insertText', false, '```\n' + text + '\n```')
      ta.setSelectionRange(selectionStart + 3, selectionStart + 3)
    } catch (e) {
      console.log('TextEditorController:wrapAsMultilineCode: ', e)
    }
  }
}

interface TextEditorProps extends TextAreaProps {
  onApply?: ((value: string) => void) | undefined
  onCancel?: (() => void) | undefined
}

const defTextEditorProps = (theme: GlobalTheme): any => {
  return {
    width: '100%',
    caretColor: theme.red,
    textColor: theme.text,
    bgColor: theme.appBg,
    borderColor: theme.text + '20'
  }
}

export const TextEditor = (props: TextEditorProps) => {
  const theme = themeManager.theme
  const customProps = { ...defTextEditorProps(theme), ...props }
  const [value, setValue] = useState(props.text ?? props.protocol?.value ?? '')
  const [width, height] = useWindowSize()

  if (props.protocol && props.protocol.value !== value) {
    setValue(props.protocol.value)
  }

  const ta = useRef<HTMLTextAreaElement>(null)

  const onChange = (event: any) => {
    setValue(event.target.value)
    if (props.protocol) props.protocol.value = event.target.value
    if (props.onChange) props.onChange(event.target.value)
    //TextEditorController.adjustScroller(ta?.current)
  }

  useEffect(() => {
    if (ta.current) {
      TextEditorController.adjustScroller(ta?.current)
      ta.current.setSelectionRange(0, 0)
    }

    if (props.keepFocus) ta.current?.focus()
  }, [width, height, props])

  const onKeyDown = (e: any) => {
    console.log('e.keyCode = ', e.keyCode)
    if (!ta.current) return

    // Ctrl+Shift+U
    if (e.ctrlKey && e.shiftKey && e.keyCode === 85) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.uppercase(ta.current)
    }
    // Ctrl+Shift+X
    if (e.ctrlKey && e.shiftKey && e.keyCode === 88) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.removeSentenceUnderCursor(ta.current)
    }
    // Ctrl+Shift+L
    else if (e.ctrlKey && e.shiftKey && e.keyCode === 76) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.lowercase(ta.current)
    } // Ctrl+Shift+`
    else if (e.ctrlKey && e.shiftKey && e.keyCode === 192) {
      if (ta.current) {
        e.preventDefault()
        e.stopPropagation()
        TextEditorController.wrapAsMultilineCode(ta.current)
        TextEditorController.scrollToCursor(ta.current)
      }
    } // Ctrl+Shift+R
    else if (e.ctrlKey && e.shiftKey && e.keyCode === 82) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.removeNewLines(ta.current)
    } // Ctrl+Shift+D
    else if (e.ctrlKey && e.shiftKey && e.keyCode === 68) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.duplicateLine(ta.current)
    } // Tab
    else if (e.keyCode === 9) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.tabulate(ta.current)
    }
    else if (e.keyCode === 13) {
      e.stopPropagation()
      e.preventDefault()
      TextEditorController.newLine(ta.current)
      TextEditorController.adjustScroller(ta.current)
    } // ESC
    else if (e.keyCode === 27) {
      e.preventDefault()
      e.stopPropagation()
      customProps.onCancel?.()
    }
    // PageUp key
    else if (e.keyCode === 33 && ta?.current) {
      e.preventDefault()
      e.stopPropagation()
      ta.current.setSelectionRange(0, 0)
      TextEditorController.scrollToCursor(ta.current)
    }
    // PageDown key
    else if (e.keyCode === 34 && ta?.current) {
      e.preventDefault()
      e.stopPropagation()
      const length = ta.current.value.length
      ta.current.setSelectionRange(length, length)
      TextEditorController.scrollToCursor(ta.current)
    }
    // Home key
    else if (e.keyCode === 36) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.moveCursorToBeginLine(ta.current)
    }
    // End key
    else if (e.keyCode === 35) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.moveCursorToEndLine(ta.current)
    }
  }

  const className = 'className' in props ? props.className + ' ' + buildClassName(customProps) : buildClassName(customProps)

  return <textarea
    className={className + ' listScrollbar'}
    value={value}
    autoFocus={customProps.autoFocus}
    ref={ta}
    spellCheck="false"
    onChange={onChange}
    onKeyDown={onKeyDown} />
}

export const ReplaceWithView = observer((props: StackProps) => {
  console.log('new ReplaceWithView')
  const editor = observeEditor()
  const theme = themeManager.theme

  return <VStack
    halign="left"
    valign="top"
    gap="15px"
    padding='40px'
    width='100%' height='100%'>

    {editor.selectedPage &&
      <>
        <InputForm
          protocol={editor.replaceSubstringProtocol}
          title='Text substring (RegExp):' />

        <InputForm
          protocol={editor.replaceWithProtocol}
          title='Replace with (RegExp):' />

        <TextButton title='Replace'
          paddingVertical='10px'
          cornerRadius='5px'
          onClick={() => {
            editor.replaceWith(editor.replaceSubstringProtocol.value, editor.replaceWithProtocol.value)
          }} />

        <Spacer height='50px' />

        <div>
          <MultilineLabel
            width='100%'
            fontSize={theme.defFontSize}
            textAlign='left'
            text={'E.g.\nSubstring: (colo)(r)\nReplace with: $1u$2\nResult: colour'}
            textColor={theme.h1 + '50'} />

        </div>
      </>
    }

  </VStack>
})
