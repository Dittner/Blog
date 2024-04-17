import ReactMarkdown from 'react-markdown'
import React from 'react'
import { themeManager } from '../application/ThemeManager'
import { buildClassName, type LabelProps, stylable } from 'react-nocss'

export const MarkdownText = stylable((props: LabelProps) => {
  const theme = themeManager.theme
  let className = 'className' in props ? props.className : ''
  className += ' ' + theme.id + ' '
  className += buildClassName(props)
  return <ReactMarkdown className={className}
                        key={props.keyValue}>{props.text ?? ''}
  </ReactMarkdown>
})
