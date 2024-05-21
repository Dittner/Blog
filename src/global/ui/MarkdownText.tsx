import ReactMarkdown from 'react-markdown'
import React from 'react'
import { themeManager } from '../application/ThemeManager'
import { buildClassName, type LabelProps, stylable } from 'react-nocss'
import { useBlogContext } from '../../App'

export const MarkdownText = stylable((props: LabelProps) => {
  const theme = themeManager.theme
  const { restApi } = useBlogContext()
  let className = 'className' in props ? props.className : ''
  className += ' ' + theme.id + ' '
  className += buildClassName(props)
  const text = props.text?.replaceAll('\n', '\n\n')
  return <ReactMarkdown className={className}
                        transformImageUri={uri => restApi.assetsUrl + uri }
                        key={props.keyValue}>{text ?? ''}
  </ReactMarkdown>
})
