import {observer} from '../../../lib/rx/RXObserver'
import {buildClassName, HStack, type StackProps, type StylableComponentProps, type TextAreaProps} from 'react-nocss'
import {observeEditor} from '../../BlogContext'
import {type GlobalTheme, themeManager} from '../../../global/application/ThemeManager'
import {LayoutLayer} from '../../../global/application/Application'
import React, {useEffect, useRef, useState} from 'react'
import {useWindowSize} from '../../../App'

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

    {editor.selectedPage &&
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
        textColor={theme.editorText + '88'}
        borderColor='undefined'
        fontSize={theme.defFontSize}
        caretColor={theme.isLight ? '#000000' : theme.red}
        bgColor={theme.appBg}
        padding="45px"
        focusState={(state: StylableComponentProps) => {
          state.textColor = theme.editorText
        }}
        keepFocus
        autoFocus/>
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

  static adjustScroller(ta: HTMLTextAreaElement | undefined | null) {
    if (ta) {
      ta.style.height = 'inherit'
      ta.style.height = `${ta.scrollHeight + 5}px`
    }
  }

  static moveCursorToEndLine(ta: HTMLTextAreaElement | undefined | null) {
    if (ta) {
      const endOfTheLineIndex = ta.value.indexOf('\n', ta.selectionStart)
      if (endOfTheLineIndex !== -1) {
        ta.setSelectionRange(endOfTheLineIndex, endOfTheLineIndex)
      } else {
        ta.setSelectionRange(ta.value.length, ta.value.length)
      }
    }
  }

  static moveCursorToBeginLine(ta: HTMLTextAreaElement | undefined | null) {
    if (ta) {
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
    borderColor: theme.text + '20',
    focusState: (state: StylableComponentProps) => {
      state.bgColor = theme.text + '05'
    }
  }
}

export const TextEditor = (props: TextEditorProps) => {
  const theme = themeManager.theme
  const customProps = {...defTextEditorProps(theme), ...props}
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
    //TextEditorController.adjustScroller(ta?.current)
    if (ta.current) ta.current.setSelectionRange(0, 0)

    if (props.keepFocus) ta.current?.focus()
  }, [width, height, props])

  const onKeyDown = (e: any) => {
    //console.log('e.keyCode = ', e.keyCode)
    // ESC
    if (e.keyCode === 27) {
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
      const length = ta?.current?.value.length ?? 0
      ta.current.setSelectionRange(length, length)
      TextEditorController.scrollToCursor(ta.current)
    }
    // Home key
    else if (e.keyCode === 36) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.moveCursorToBeginLine(ta?.current)
    }
    // End key
    else if (e.keyCode === 35) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.moveCursorToEndLine(ta?.current)
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
    onKeyDown={onKeyDown}/>
}
