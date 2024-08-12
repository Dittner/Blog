import React from 'react'
import {themeManager} from '../application/ThemeManager'
import {buildClassName, type LabelProps} from 'react-nocss'
import {useBlogContext} from '../../App'
import {MathJax} from 'better-react-mathjax'
import ReactMarkdown from 'react-markdown'

export const MarkdownText = (props: LabelProps) => {
  const theme = themeManager.theme
  const {restApi} = useBlogContext()
  let className = 'className' in props ? props.className + ' ' : ''
  className += theme.id + ' '
  className += buildClassName(props)
  const text = props.text?.replaceAll('\n\n', '\n***\n').replaceAll('\n', '\n\n')

  return <MathJax dynamic inline className={className}>
    <ReactMarkdown key={text}
      transformImageUri={uri => restApi.assetsUrl + uri }>
      {text ?? ''}
    </ReactMarkdown>
  </MathJax>
}
