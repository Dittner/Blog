import * as React from 'react'
import {themeManager} from '../application/ThemeManager'
import {Button, type ButtonProps} from 'react-nocss'

export const TextButton = (props: ButtonProps) => {
  if ('visible' in props && !props.visible) return <></>
  const theme = themeManager.theme

  return <Button
    fontSize='0.9rem'
    paddingBottom='1px'
    minHeight='25px'
    bgColor={undefined}
    textColor={theme.red}
    hoverState={(state: ButtonProps) => {
      state.btnCursor = true
      state.textColor = theme.isLight ? theme.red + 'cc' : theme.white
    }}
    {...props}/>
}

/*
*
* IconButton
*
* */

export type IconType =
  'sun'
  | 'moon'
  | 'down'
  | 'up'
  | 'scrollBack'
  | 'nextPage'
  | 'prevPage'
  | 'close'
  | 'menu'
  | 'settings'
  | 'search'
  | 'plus'
  | 'delete'
  | 'edit'
  | 'link'
  | 'folder'

interface IconButtonProps extends ButtonProps {
  icon: IconType
}

export const IconButton = (props: IconButtonProps) => {
  if ('visible' in props && !props.visible) return <></>
  const theme = themeManager.theme

  return <Button
    className={'icon-' + props.icon}
    paddingHorizontal='10px'
    minHeight='40px'
    bgColor={undefined}
    textColor={theme.red}
    hoverState={state => {
      state.textColor = theme.isLight ? theme.red + 'cc' : theme.header
    }}
    selectedState={state => {
      state.textColor = theme.white
      state.bgColor = theme.isLight ? theme.red : theme.transparent
    }}
    disabledState={state => {
      state.opacity = '1'
      state.textColor = theme.text50
    }}
    onClick={props.onClick}
    {...props}/>
}
