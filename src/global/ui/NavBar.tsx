import {LayoutLayer} from '../application/Application'
import {Button, type ButtonProps, HStack, Label, LinkButton, type LinkButtonProps, Spacer} from 'react-nocss'
import React from 'react'
import {IconButton, TextButton} from './Button'
import {themeManager} from '../application/ThemeManager'
import {observeApi, observeBlogMenu, observeEditor, observeStoreService, observeUser} from '../../blog/BlogContext'
import {type File} from '../../blog/domain/BlogModel'
import {observer} from '../../lib/rx/RXObserver'
import type {JSX} from 'react/jsx-runtime'

export const NavBar = observer(() => {
  const blogMenu = observeBlogMenu()
  const user = observeUser()
  const storeService = observeStoreService()
  const api = observeApi()
  const theme = themeManager.theme
  const isFileEditing = user.selectedFile?.isEditing ?? false

  const links: JSX.Element[] = []
  let curFile: File | undefined
  if (user.selectedFile) {
    links.push(<NavLinkBtn key={user.selectedFile.uid} title={user.selectedFile.name} link={user.selectedFile.link}/>)
    links.push(<NavSeparator key={user.selectedFile.uid + 'sep'}/>)
    curFile = user.selectedFile.parent
  }

  while (curFile) {
    links.push(<NavLinkBtn key={curFile.uid} title={curFile.info.author?.shortName ?? curFile.info.name} link={curFile.link}/>)
    links.push(<NavSeparator key={curFile.uid + 'sep'}/>)
    curFile = curFile.parent
  }

  return <HStack
    className='blurred'
    position='fixed'
    top='0' left='0'
    bgColor={isFileEditing ? theme.appBg : theme.appBg + '50'}
    borderBottom={isFileEditing ? ['2px', 'solid', theme.text + '20'] : undefined}
    halign='left' valign='center'
    width='100%' height='40px' gap="8px"
    paddingRight='10px'
    layer={LayoutLayer.HEADER}>
    <IconButton icon={theme.isLight ? 'sun' : 'moon'} onClick={() => {
      theme.isLight ? themeManager.setDarkTheme() : themeManager.setLightTheme()
    }}/>

    <Button
      title='INDEX'
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

    {links.reverse()}

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
      visible={storeService.isStorePending}
      disabled={!storeService.isStorePending}
      onClick={() => {
        storeService.store()
      }}/>

    {user.selectedFile && api.isServerRunning && <>
      {isFileEditing &&
        <ToolsPanel/>
      }

      {/*<Label*/}
      {/*  whiteSpace="pre"*/}
      {/*  width='110px'*/}
      {/*  textAlign='right'*/}
      {/*  text={editor.editMode ? 'Edit mode: ' : 'Read mode: '}*/}
      {/*  textColor={theme.menuItem}/>*/}

      {/*<Switcher*/}
      {/*  isSelected={editor.editMode}*/}
      {/*  bgColor={theme.text50}*/}
      {/*  selectedBgColor={theme.red}*/}
      {/*  thumbColor={theme.isLight ? theme.white : theme.black}*/}
      {/*  popUp='Toggle Edit Mode (Ctrl + Shift + E)'*/}
      {/*  onClick={() => {*/}
      {/*    editor.toggleEditMode()*/}
      {/*  }}/>*/}
    </>}
  </HStack>
})

const NavSeparator = () => {
  return <Label
    text='>'
    opacity='0.5'
    textColor={themeManager.theme.header}
    fontWeight='800'
    fontSize='0.5rem'/>
}

const NavLinkBtn = (props: LinkButtonProps) => {
  const theme = themeManager.theme
  return <LinkButton
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

const ToolsPanel = observer(() => {
  const editor = observeEditor()
  const user = observeUser()

  const createPage = () => {
    editor.createPage()
  }

  return (
    <HStack
      className="tools"
      valign="center"
      halign="left"
      height="40px" gap="4px">

      <TextButton
        title='Add Page'
        popUp="Add new page (Ctrl + Shift + P)"
        onClick={createPage}/>

      <IconButton
        icon="up"
        popUp="Move page up"
        onClick={() => { editor.movePageUp() }}
        disabled={!editor.selectedPage || !editor.selectedPage.movable}/>

      <IconButton
        icon="down"
        popUp="Move page down"
        onClick={() => { editor.movePageDown() }}
        disabled={!editor.selectedPage || !editor.selectedPage.movable}/>

      <IconButton
        icon="delete"
        popUp="Delete page"
        onClick={() => { editor.deletePage() }}
        disabled={!editor.selectedPage || !editor.selectedPage.removable}/>

      <Spacer width='20px'/>

      <TextButton
        title='Quit'
        popUp="Finish editing (Ctrl + Shift + E)"
        onClick={() => { user.selectedFile && (user.selectedFile.isEditing = false) }}/>

    </HStack>
  )
})
