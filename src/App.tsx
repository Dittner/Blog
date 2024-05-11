import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import React, { useLayoutEffect, useState } from 'react'
import { GlobalContext, observeApp } from './global/GlobalContext'
import { observeThemeManager, themeManager } from './global/application/ThemeManager'
import { observer } from 'react-observable-mutations'
import { BlogContext } from './blog/BlogContext'
import { BlogPage } from './blog/ui/BlogPage'
import { IconButton } from './global/ui/Button'
import { HStack, Label } from 'react-nocss'
import { LayoutLayer } from './global/application/Application'

export const API_URL = process.env.REACT_APP_API_URL
export const IS_DEV_MODE = process.env.REACT_APP_MODE === 'development'

console.log('React v.' + React.version)
console.log('API_URL:', API_URL)
console.log('DEV_MODE:', IS_DEV_MODE)

const globalContext = React.createContext(GlobalContext.init())
export const useGlobalContext = () => React.useContext(globalContext)

const blogContext = React.createContext(BlogContext.init())
export const useBlogContext = () => React.useContext(blogContext)

export const App = observer(() => {
  console.log('new App')
  observeThemeManager()

  return <>
    <BrowserRouter>
      <Routes>
        <Route path="/repo" element={<BlogPage/>}/>
        <Route path="/repo/:authorId" element={<BlogPage/>}/>
        <Route path="/repo/:authorId/:bookId" element={<BlogPage/>}/>
        <Route path="/" element={<Navigate replace to="/repo"/>}/>
        <Route path="*" element={<Navigate replace to="/"/>}/>
      </Routes>
    </BrowserRouter>
    <ErrorMsgView/>
  </>
})

export const ErrorMsgView = observer(() => {
  console.log('new ErrorMsgView')

  const app = observeApp()
  const theme = themeManager.theme

  const close = () => {
    if (app.errorMsg) {
      app.errorMsg = ''
    }
  }

  if (!app.errorMsg) {
    return <></>
  }

  return <HStack halign="stretch"
                 valign="center"
                 width="100%"
                 bottom='0'
                 minHeight="50px"
                 bgColor={theme.modalViewBg}
                 layer={LayoutLayer.ERR_MSG}
                 position='fixed'>

    <Label className='ibm'
           width='100%'
           textAlign='center'
           text={app.errorMsg}
           textColor={theme.text}/>

    <IconButton icon="close"
                popUp="Close"
                textColor={theme.text50}
                hoverState={state =>
                  state.textColor = theme.text}
                onClick={close}/>
  </HStack>
})

export function useWindowSize() {
  const [size, setSize] = useState([0, 0])
  useLayoutEffect(() => {
    let width = window.innerWidth
    let height = window.innerHeight

    function updateSize() {
      if (Math.abs(window.innerWidth - width) > 100 || Math.abs(window.innerHeight - height) > 100) {
        width = window.innerWidth
        height = window.innerHeight
        setSize([window.innerWidth, window.innerHeight])
      }
    }

    window.addEventListener('resize', updateSize)
    updateSize()
    return () => {
      window.removeEventListener('resize', updateSize)
    }
  }, [])
  return size
}
