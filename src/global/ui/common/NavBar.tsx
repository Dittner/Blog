import { observer } from 'react-observable-mutations'
import { useNavigate } from 'react-router-dom'
import { LayoutLayer } from '../../application/Application'
import { HStack, Label, Spacer } from 'react-nocss'
import React from 'react'
import { useWindowSize } from '../../../App'
import { IconButton } from './Button'
import { themeManager } from '../../application/ThemeManager'

export class NavBarLink {
  readonly id: string
  readonly title: string

  constructor(id: string, title: string) {
    this.id = id
    this.title = title
  }
}

export interface NavBarProps {
  links: Array<NavBarLink | string>
  useBg?: boolean
}

export const NavBar = observer((props: NavBarProps) => {
  useWindowSize()
  const theme = themeManager.theme
  const navigate = useNavigate()
  let barOffset = 20
  if (window.innerWidth > theme.maxContentWidthPx) {
    barOffset = (window.innerWidth - theme.maxContentWidthPx) / 2 - 5
  } else if (window.innerWidth > theme.maxBlogTextWidthPx) {
    barOffset = 0
  }

  return <HStack fontSize='0.9rem' position='fixed'
                 top='0' left='0'
                 halign='left' valign='center'
                 width='100%'
                 bgColor={props.useBg ? theme.appBg + 'cc' : '#00000000'}
                 height='30px' margin='0'
                 gap="5px"
                 layer={LayoutLayer.HEADER}>
    <IconButton icon={theme.isLight ? 'sun' : 'moon'} onClick={() => {
      theme.isLight ? themeManager.setDarkTheme() : themeManager.setLightTheme()
    }}/>

    <Spacer width={barOffset - 50 + 'px'}/>

    {props.links.map((link, index) => {
      if (link instanceof NavBarLink) {
        return <Label key={link.id}
                      text={link.title}
                      textColor={theme.red}
                      fontSize='inherit'
                      fontWeight='400'
                      hoverState={state => {
                        state.textColor = theme.header
                        state.btnCursor = true
                      }}
                      onClick={() => {
                        navigate(link.id)
                      }}/>
      } else {
        return <Label key={index + link}
                      text={link}
                      opacity='0.5'
                      textColor={theme.header}
                      fontWeight='800'
                      fontSize='0.6rem'/>
      }
    })}
  </HStack>
})
