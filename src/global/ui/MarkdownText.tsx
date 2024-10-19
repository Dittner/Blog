import React from 'react'
import {themeManager} from '../application/ThemeManager'
import {buildClassName, type LabelProps} from 'react-nocss'
import {MathJax} from 'better-react-mathjax'
import ReactMarkdown from 'react-markdown'
import {blogContext} from '../../App'

export const MarkdownText = (props: LabelProps) => {
  const theme = themeManager.theme
  const restApi = blogContext.restApi
  let className = 'className' in props ? props.className + ' ' : ''
  className += theme.id + ' '
  className += buildClassName(props)
  const text = props.text?.replaceAll('\n\n', '\n***\n').replaceAll('\n', '\n\n') ?? ''

  if (text.includes('$')) {
    return <MathJax dynamic inline className={className}>
      <ReactMarkdown key={text}
        urlTransform={uri => restApi.assetsUrl + uri }>
        {text ?? ''}
      </ReactMarkdown>
    </MathJax>
  } else {
    return <ReactMarkdown className={className}
      key={text}
      urlTransform={uri => restApi.assetsUrl + uri }>
      {text ?? ''}
    </ReactMarkdown>
  }
}
