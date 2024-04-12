import { Image, Label, type LabelProps, VStack } from 'react-nocss'
import { themeManager } from '../../application/ThemeManager'
import { observer } from 'react-observable-mutations'
import React from 'react'

export const BlogLbl = (props: LabelProps) => {
  if ('visible' in props && !props.visible) return <></>
  return <Label fontSize='1.25rem'
                className='article'
                textColor='inherit'
                {...props}/>
}

export interface BlogQuoteProps extends LabelProps {
  author?: string
}

export const BlogQuote = (props: BlogQuoteProps) => {
  if ('visible' in props && !props.visible) return <></>
  const theme = themeManager.theme

  return <VStack width={props.width ?? '100%'}
                 textColor={theme.text}
                 paddingVertical='20px'>

    <Label textColor='inherit'>
      <span className="icon-quote"/>
    </Label>

    <Label textColor='inherit'
           className='article'
           text={props.text}
           width='100%'
           fontSize='1.1rem'
           fontStyle='italic'
           fontWeight='400'/>
    {props.author &&
      <Label text={props.author}
             className='article'
             width='100%'
             textAlign='right'
             textColor='inherit'
             paddingHorizontal='20px'
             fontSize='1.1rem'
             fontWeight='bold'/>
    }

  </VStack>
}

/*
*
*
* Screenshot
*
*
* */

export interface ScreenshotProps {
  src: string
  title: string
}

export const Screenshot = observer((props: ScreenshotProps) => {
  const theme = themeManager.theme

  console.log('new Screenshot: ')

  return <VStack halign='right' valign='top' gap='0' width='100%' maxWidth={theme.maxContentWidth}>
    <Image src={props.src}
           preview='/blog/preview.jpg'
           alt="Matrix screenshoot"
           top="0"
           width='100%'
           height='auto'
           halign="center"
           valign="center"/>

    <Label className="dev"
           textColor={theme.text50}
           text={props.title}
           fontSize='0.8rem'/>
  </VStack>
})
