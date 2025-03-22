import * as React from 'react'
import {useState} from 'react'
import {HStack, Label, stylable, type StylableComponentProps, TextInput, type TextInputProps, VStack} from 'react-nocss'
import {type GlobalTheme, themeManager} from '../application/ThemeManager'

/*
*
* InputForm
*
* */

export interface InputFormProps extends TextInputProps {
  title?: string
  titleSize?: string
  titleColor?: string
}

const defInputFormProps = (theme: GlobalTheme): any => {
  return {
    width: '100%',
    height: '40px',
    caretColor: theme.text,
    textColor: theme.h1,
    bgColor: theme.text + '10',
    titleSize: '1rem',
    titleColor: theme.text,
    fontSize: '1.4rem',
    padding: '10px',
    autoCorrect: 'off',
    autoComplete: 'off',
    border: 'none',
    borderBottom: ['1px', 'solid', theme.violet + '50'],
    focusState: (state: StylableComponentProps) => {
      state.borderBottom = ['1px', 'solid', theme.red]
    }
  }
}

export const InputForm = (props: InputFormProps) => {
  console.log('new InputForm')
  const style = {...defInputFormProps(themeManager.theme), ...props}

  return (
    <VStack
      halign="left" valign="top" gap="0px"
      width={style.width}>

      {style.title &&
        <Label fontSize={style.titleSize}
          width='100%' textAlign='left'
          text={style.title}
          textColor={style.titleColor}/>
      }

      <TextInput {...style}/>
    </VStack>
  )
}

export interface TextInputFormProps {
  text: string
  title: string
  autoFocus: boolean
  onCancel: () => void
  onApply: (title: string) => void
}

export const TextInputForm = stylable((props: TextInputFormProps) => {
  console.log('new DocEditForm')
  const [inputProtocol, _] = useState({value: props.text})
  const theme = themeManager.theme

  const apply = () => {
    props.onApply(inputProtocol.value)
  }
  const cancel = () => {
    props.onCancel()
  }

  return (
    <InputForm
      type="text"
      title={props.title}
      titleColor={theme.text50}
      autoFocus={props.autoFocus}
      paddingHorizontal='5px'
      height='30px'
      protocol={inputProtocol}
      onSubmitted={apply}
      onCanceled={cancel}/>
  )
})
