import { observe, observer } from 'react-observable-mutations'
import { useParams } from 'react-router-dom'
import { LayoutLayer } from '../application/Application'
import { Button, type ButtonProps, HStack, Label, LinkButton, type LinkButtonProps } from 'react-nocss'
import React from 'react'
import { IconButton } from './Button'
import { themeManager } from '../application/ThemeManager'
import { observeAuthorList, observeBlogMenu } from '../../blog/BlogContext'

export const NavBar = observer(() => {
  const blogMenu = observeBlogMenu()
  const authorList = observeAuthorList()
  const theme = themeManager.theme
  const params = useParams()

  const selectedAuthorId = params.authorId
  const selectedBookId = params.bookId
  const selectedAuthor = authorList.findAuthor(a => a.uid === selectedAuthorId)
  if (selectedAuthor) observe(selectedAuthor)
  const selectedBook = selectedAuthor?.findBook(b => b.id === selectedBookId)

  return <HStack fontSize='0.9rem' position='fixed'
                 top='0' left='0'
                 halign='left' valign='center'
                 width='100%' height='40px' gap="5px"
                 layer={LayoutLayer.HEADER}>
    <IconButton icon={theme.isLight ? 'sun' : 'moon'} onClick={() => {
      theme.isLight ? themeManager.setDarkTheme() : themeManager.setLightTheme()
    }}/>

    <Button title='INDEX'
            fontSize='0.9rem'
            paddingBottom='1px'
            minHeight='25px'
            bgColor={undefined}
            textColor={theme.red}
            isSelected={blogMenu.isShown}
            hoverState={(state: ButtonProps) => {
              state.btnCursor = true
              if (!blogMenu.isShown) state.textColor = theme.header
            }}
            onClick={() => {
              blogMenu.isShown = !blogMenu.isShown
            }}
            selectedState={(state: ButtonProps) => {
              state.textColor = theme.header
            }}/>

    {selectedAuthor &&
      <>
        <NavSeparator/>
        <NavLinkBtn title={selectedAuthor.shortName}
                    link={'/repo/' + selectedAuthorId}/>
      </>
    }

    {selectedAuthorId && selectedBook &&
      <>
        <NavSeparator/>
        <NavLinkBtn title={selectedBook.title}
                    link={'/repo/' + selectedAuthorId + '/' + selectedBookId}/>
      </>
    }

  </HStack>
})

const NavSeparator = () => {
  return <Label text='>'
                opacity='0.5'
                textColor={themeManager.theme.header}
                fontWeight='800'
                fontSize='0.6rem'/>
}

const NavLinkBtn = (props: LinkButtonProps) => {
  const theme = themeManager.theme
  return <LinkButton fontSize='0.9rem'
                     minHeight='25px'
                     bgColor={undefined}
                     textColor={theme.red}
                     hoverState={(state: ButtonProps) => {
                       state.textColor = theme.header
                       state.textDecoration = 'none'
                     }}
                     {...props}/>
}
