import * as React from 'react'
import {useState} from 'react'
import {HStack, Label, stylable, type StylableComponentProps, TextInput, type TextInputProps} from 'react-nocss'
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
    height: '30px',
    caretColor: theme.text,
    textColor: theme.text,
    bgColor: theme.text + '05',
    titleSize: '0.9rem',
    titleColor: theme.header,
    fontSize: '1rem',
    padding: '10px',
    autoCorrect: 'off',
    autoComplete: 'off',
    border: 'none',
    borderBottom: ['1px', 'solid', theme.violet + '50'],
    focusState: (state: StylableComponentProps) => {
      state.bgColor = theme.violet + '20'
    }
  }
}

export const InputForm = (props: InputFormProps) => {
  console.log('new InputForm')
  const style = {...defInputFormProps(themeManager.theme), ...props}

  return (
    <HStack
      halign="left" valign="center" gap="5px"
      width={style.width}>

      {style.title &&
        <Label fontSize={style.titleSize}
          width='100px' textAlign='right'
          text={style.title}
          textColor={style.titleColor}/>
      }

      <TextInput {...style}/>
    </HStack>
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
