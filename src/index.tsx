import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { App } from './App'
import { MathJaxContext } from 'better-react-mathjax'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(
  <MathJaxContext config={{
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']]
    }
  }}>
    <App />
  </MathJaxContext>
)
