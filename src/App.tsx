import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import React from 'react'
import { GlobalContext } from './global/GlobalContext'
import { observeThemeManager } from './global/application/ThemeManager'
import { observer } from 'react-observable-mutations'
import { BlogContext } from './blog/BlogContext'
import { BlogPage } from './blog/ui/BlogPage'

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
  </>
})
