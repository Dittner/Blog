import React from 'react'
import { buildClassName, type LabelProps } from 'react-nocss'
import ReactMarkdown, { type ExtraProps } from 'react-markdown'
import { MathJax } from 'better-react-mathjax'
import { blogContext } from '../../App'
import { themeManager } from '../application/ThemeManager'

const renderers = {
  pre: (props: JSX.IntrinsicElements['pre'] & ExtraProps) => {
    const { children, className, node, ...rest } = props
    console.log('className:', className)
    //const match = typeof children === 'string' && children.startsWith('#>')
    const match = className !== 'language-jss'
    return match
      ? (
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'center'
        }}>
          <pre {...rest} className={className}>
            <p>{children}</p>
          </pre>
        </div>
      )
      : (
        <pre {...rest} className={className}>
          {children}
        </pre>
      )
  }
}

const rules: any[] = [
  //blockquote
  [/^> +(.*)\n?/gm, '<blockquote><p>$1</p></blockquote>'],

  //p
  //[/^([^<].*)\s*/gm, '<p>$1</p>'],
  //align center
  [/^==>\s?(.+)\n?/gm, '<p class="md-right">$1</p>'],
  [/^=>\s?(.+)\n?/gm, '<p class="md-center">$1</p>'],

    //list
    [/^\+ +(.*)\n?/gm, '<li>$1</li>'],
    [/^(<li>.+<\/li>)/gm, '<ul>$1</ul>\n'],
    [/^\d+\. +((.|\n(?!(\d+\. |\n|`)))*)\n?/gm, '<li>$1</li>'],
    //[/^(<li>((.|\n)+)<\/li>)/gm, '<ol>$1</ol>'],
    [/^```ol\n/gm, '<ol>'],
    [/<\/li>```/gm, '</li></ol>'],
    [/<\/ul>\n/gm, '<\/ul>'],

  //div (code)
  //[/^```([a-zA-Z]+)\n(((?!```)(.|\n))+)\n+```\n?/gm, '<div class="$1">$2</div>'],
  [/```([a-zA-Z]+)\n/gm, '<div class="$1"><div>'],
  [/^``` *\n/gm, '</div></div>'],
  [/``` *$/gm, '</div></div>'],
  [/`([^`]+)`/g, '<code>$1</code>'],

  //image
  //![screenshot](/repo/dittner/movie/img/crash1.jpg)
  [/^!\[([^\]]+)\]\(([^)]+)\)\n?/gm, '<img alt="$1" src="http://127.0.0.1:5005/api/asset$2"/>'],

  //links
  [/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#2A5DB0;text-decoration: none;">$1</a>'],


  //headers
  [/\$?#{6}\s?(.+)\n?/g, '<h6>$1</h6>'],
  [/\$?#{5}\s?(.+)\n?/g, '<h5>$1</h5>'],
  [/\$?#{4}\s?(.+)\n?/g, '<h4>$1</h4>'],
  [/\$?#{3}\s?(.+)\n?/g, '<h3>$1</h3>'],
  [/\$?#{2}\s?(.+)\n?/g, '<h2>$1</h2>'],
  [/\$?#\s?(.+)\n?/g, '<h1>$1</h1>'],

  //bold
  [/_{2,}([^_\n]+)_{2,}/g, '<b>$1</b>'],

  //italic
  [/([^\/])_([^_\n]+)_/g, '$1<i>$2</i>'],
  [/^_([^_\n]+)_/g, '<i>$1</i>'], //ignoring formatting with slash
  [/\/_/g, '_'],

  //stars
  [/^(\*{3,})\n/gm, '<p class="md-delim">$1</p>'],

  //br
  [/\n{3,}/g, '\n\n'],
  [/\n/g, '<br/>']
]


export const MarkdownText = (props: LabelProps) => {
  const theme = themeManager.theme
  let className = 'className' in props ? props.className + ' ' : ''
  className += theme.id + ' ' + buildClassName(props)
  let html = props.text ?? ''
  rules.forEach((item) => {
    html = html.replace(item[0], item[1])
  })
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  //return <div>{html}</div>
}

// export const MarkdownText2 = (props: LabelProps) => {
//   const theme = themeManager.theme
//   const restApi = blogContext.restApi
//   let className = 'className' in props ? props.className + ' ' : ''
//   className += theme.id + ' ' + buildClassName(props)
//   const text = props.text?.replaceAll('\n\n', '\n***\n').replaceAll('\n', '\n\n') ?? ''
//   //const text = props.text?.replaceAll('\n\n', '\n') ?? ''

//   if (text.includes('$')) {
//     return <MathJax dynamic inline className={className}>
//       <ReactMarkdown key={text}
//         urlTransform={uri => restApi.assetsUrl + uri}>

//         {text ?? ''}
//       </ReactMarkdown>
//     </MathJax>
//   } else {
//     return <ReactMarkdown className={className}
//       key={text}
//       components={renderers}
//       disallowedElements={['code']} unwrapDisallowed={true}
//       urlTransform={uri => restApi.assetsUrl + uri}>
//       {text ?? ''}
//     </ReactMarkdown>
//   }
// }
