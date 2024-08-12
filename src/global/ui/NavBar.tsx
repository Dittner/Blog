import {useParams} from 'react-router-dom'
import {LayoutLayer} from '../application/Application'
import {Button, type ButtonProps, HStack, Label, LinkButton, type LinkButtonProps, Spacer, Switcher} from 'react-nocss'
import React from 'react'
import {IconButton} from './Button'
import {themeManager} from '../application/ThemeManager'
import {observeApi, observeBlogMenu, observeEditor, observeRepo, observeUser} from '../../blog/BlogContext'
import {type Book} from '../../blog/domain/BlogModel'
import {observe, observer} from '../../lib/rx/RXObserver'

export const NavBar = observer(() => {
  const blogMenu = observeBlogMenu()
  const authorList = observeUser()
  const editor = observeEditor()
  const repo = observeRepo()
  const api = observeApi()
  const theme = themeManager.theme
  const params = useParams()

  const selectedAuthorId = params.authorId
  const selectedBookId = params.bookId
  const selectedAuthor = authorList.findAuthor(a => a.id === selectedAuthorId)
  if (selectedAuthor) observe(selectedAuthor)
  const selectedBook = observe(selectedAuthor?.findBook(b => b.id === selectedBookId))

  return <HStack
    className='blurred'
    fontSize='0.9rem' position='fixed'
    top='0' left='0'
    bgColor={editor.editMode ? theme.appBg : theme.appBg + '50'}
    borderBottom={editor.editMode ? ['2px', 'solid', theme.text + '20'] : undefined}
    halign='left' valign='center'
    width='100%' height='40px' gap="5px"
    paddingRight='10px'
    layer={LayoutLayer.HEADER}>
    <IconButton icon={theme.isLight ? 'sun' : 'moon'} onClick={() => {
      theme.isLight ? themeManager.setDarkTheme() : themeManager.setLightTheme()
    }}/>

    <Button
      title='INDEX'
      fontSize='0.9rem'
      paddingBottom='1px'
      minHeight='25px'
      bgColor={undefined}
      textColor={theme.menuItem}
      isSelected={blogMenu.isShown}
      hoverState={(state: ButtonProps) => {
        state.btnCursor = true
        if (!blogMenu.isShown) state.textColor = theme.red
      }}
      onClick={() => {
        blogMenu.isShown = !blogMenu.isShown
      }}
      selectedState={(state: ButtonProps) => {
        state.textColor = theme.menuSelectedItem
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

    <Spacer/>

    <RedButton
      title="Save"
      position='absolute'
      left={(window.innerWidth - 170 >> 1) + 'px'}
      paddingHorizontal='50px'
      cornerRadius='4px'
      width='150px'
      height='35px'
      padding='0'
      popUp='Save Changes (Ctrl + Shift + S)'
      visible={repo.isStorePending}
      disabled={!repo.isStorePending}
      onClick={() => {
        repo.store()
      }}/>

    {selectedBook && api.isServerRunning && <>
      <ToolsPanel book={selectedBook}/>

      <Label
        whiteSpace="pre"
        width='110px'
        textAlign='right'
        text={editor.editMode ? 'Edit mode: ' : 'Read mode: '}
        textColor={theme.menuItem}/>

      <Switcher
        isSelected={editor.editMode}
        bgColor={theme.text50}
        selectedBgColor={theme.red}
        thumbColor={theme.isLight ? theme.white : theme.black}
        popUp='Toggle Edit Mode (Ctrl + Shift + E)'
        onClick={() => {
          editor.editMode = !editor.editMode
        }}/>
    </>}
  </HStack>
})

const NavSeparator = () => {
  return <Label
    text='>'
    opacity='0.5'
    textColor={themeManager.theme.header}
    fontWeight='800'
    fontSize='0.6rem'/>
}

const NavLinkBtn = (props: LinkButtonProps) => {
  const theme = themeManager.theme
  return <LinkButton
    fontSize='0.9rem'
    minHeight='25px'
    bgColor={undefined}
    textColor={theme.menuItem}
    hoverState={(state: ButtonProps) => {
      state.textColor = theme.red
      state.textDecoration = 'none'
    }}
    {...props}/>
}

const RedButton = (props: ButtonProps) => {
  if ('visible' in props && !props.visible) return <></>
  const theme = themeManager.theme

  return <Button
    textColor='#ffFFff'
    bgColor={theme.red + 'dd'}
    hoverState={state => {
      state.bgColor = theme.red
    }}
    selectedState={state => {
      state.bgColor = theme.red
    }}
    disabledState={state => {
      state.bgColor = theme.gray
    }}
    {...props}/>
}

const ToolsPanel = observer(({book}: { book: Book }) => {
  const editor = observeEditor()
  const theme = themeManager.theme

  const createPage = () => {
    if (editor.editMode) {
      editor.createPage()
    }
  }

  if (editor.editMode) {
    return (
      <HStack
        className="tools"
        valign="center"
        halign="left"
        height="40px" gap="4px">

        <Button
          title='New Page'
          popUp="Create New Page (Ctrl + Shift + P)"
          fontSize='0.9rem'
          paddingBottom='1px'
          paddingHorizontal='10px'
          minHeight='25px'
          bgColor={undefined}
          textColor={theme.red}
          hoverState={(state: ButtonProps) => {
            state.btnCursor = true
            state.textColor = theme.isLight ? theme.red + 'cc' : theme.white
          }}
          onClick={createPage}/>

        <IconButton
          icon="up"
          popUp="Move Page Up"
          onClick={() => { editor.movePageUp() }}
          disabled={!editor.selectedPage}/>

        <IconButton
          icon="down"
          popUp="Move Page Down"
          onClick={() => { editor.movePageDown() }}
          disabled={!editor.selectedPage}/>

        <IconButton
          icon="delete"
          popUp="Delete Page"
          onClick={() => { editor.deletePage() }}
          disabled={!editor.selectedPage}/>

      </HStack>
    )
  }
  return <></>
})
