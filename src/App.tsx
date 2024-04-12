import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import React, { lazy, Suspense, useLayoutEffect, useState } from 'react'
import { Spinner } from './global/ui/common/Loading'
import { LayoutLayer } from './global/application/Application'
import { HStack, Label, VStack } from 'react-nocss'
import { IconButton, TextButton } from './global/ui/common/Button'
import { GlobalContext, observeApp } from './global/GlobalContext'
import { LibraryContext } from './library/LibraryContext'
import { observeThemeManager, themeManager } from './global/application/ThemeManager'
import { ArticleContext } from './article/ArticleContext'
import { observer } from 'react-observable-mutations'

export const API_URL = process.env.REACT_APP_API_URL
export const IS_DEV_MODE = process.env.REACT_APP_MODE === 'development'

console.log('React v.' + React.version)
console.log('API_URL:', API_URL)
console.log('DEV_MODE:', IS_DEV_MODE)

const globalContext = React.createContext(GlobalContext.init())
export const useGlobalContext = () => React.useContext(globalContext)

const articleContext = React.createContext(ArticleContext.init())
export const useBlogContext = () => React.useContext(articleContext)

const libraryContext = React.createContext(LibraryContext.init())
export const useLibraryContext = () => React.useContext(libraryContext)

export const LazyBlogPage = lazy(async() => await import('./article/ui/ArticleListPage').then((module) => ({ default: module.ArticleListPage })))
export const LazyArticlePage = lazy(async() => await import('./article/ui/ArticlePage').then((module) => ({ default: module.ArticlePage })))
export const LazyLibraryPage = lazy(async() => await import('./library/ui/LibraryPage').then((module) => ({ default: module.LibraryPage })))

export const App = observer(() => {
  console.log('new App')
  observeThemeManager()

  return <>
    <BrowserRouter>
      <Suspense fallback={<Spinner/>}>
        <Routes>
          <Route path="/loading" element={<Spinner/>}/>
          <Route path="/blog/:articleUID" element={<LazyArticlePage/>}/>
          <Route path="/blog" element={<LazyBlogPage/>}/>
          <Route path="/library" element={<LazyLibraryPage/>}/>
          <Route path="/library/:authorUID" element={<LazyLibraryPage/>}/>
          <Route path="/library/:authorUID/:bookId" element={<LazyLibraryPage/>}/>
          <Route path="/" element={<Navigate replace to="/blog"/>}/>
          <Route path="*" element={<Navigate replace to="/"/>}/>
        </Routes>
      </Suspense>
    </BrowserRouter>

    <ErrorMsgView/>
    <ModalView/>
  </>
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

export const ModalView = observer(() => {
  console.log('new ModalView')

  const app = observeApp()
  const theme = themeManager.theme
  const apply = () => {
    if (app.dialog) {
      app.dialog.onApply?.()
      app.dialog = undefined
    }
  }

  const cancel = () => {
    if (app.dialog) {
      app.dialog.onCancel?.()
      app.dialog = undefined
    }
  }

  const ok = () => {
    if (app.dialog) {
      app.dialog = undefined
    }
  }

  if (!app.dialog) {
    return <></>
  }

  const hasApplyBtn = app.dialog.onApply !== undefined
  const hasCancelBtn = app.dialog.onCancel !== undefined
  const hasOkBtn = !hasApplyBtn && !hasCancelBtn

  return <VStack halign="center"
                 valign="center"
                 width="100%"
                 height="100%"
                 bgColor={theme.black25}
                 layer={LayoutLayer.MODAL}
                 position='fixed'>

    <VStack halign="stretch"
            valign="center"
            shadow="0 10px 20px #00000020"
            bgColor={theme.panelBg}
            borderColor={theme.panelBg}
            padding='40px'
            gap="30px" width='100%' maxWidth='500px'>
      {app.dialog &&
        <>
          <Label type="h3"
                 width='100%'
                 textAlign='center'
                 text={app.dialog?.title}
                 textColor={theme.black}
                 layer={LayoutLayer.ONE}/>

          <Label width='100%'
                 text={app.dialog?.text}
                 textColor={theme.black}/>

          <HStack halign="center" valign="top" gap="50px">
            {app.dialog.onCancel &&
              <TextButton title="No"
                          onClick={cancel}/>
            }

            {hasOkBtn &&
              <TextButton title="Ok"
                          onClick={ok}/>
            }

            {hasApplyBtn &&
              <TextButton title="Yes"
                          onClick={apply}/>
            }

          </HStack>
        </>
      }
    </VStack>
  </VStack>
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
                 bgColor={theme.red}
                 layer={LayoutLayer.ERR_MSG}
                 position='fixed'>

    <Label className='ibm'
           width='100%'
           textAlign='center'
           text={app.errorMsg}
           textColor={theme.black}/>

    <IconButton icon="close"
                popUp="Close"
                textColor={theme.red}
                hoverState={state =>
                  state.textColor = theme.red}
                onClick={close}/>
  </HStack>
})
