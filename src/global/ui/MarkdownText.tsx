import React from 'react'
import { buildClassName, type LabelProps } from 'react-nocss'
import { GlobalTheme, themeManager } from '../application/ThemeManager'
import { Grammar, Lexema, MDToken } from './Grammar'

const rules: any[] = [
  //character escaping
  [/\\`/gm, '&#x60'],
  [/\\#/gm, '&#x23'],

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
  [/`([^`]+)`/g, '<em>$1</em>'],

  //image
  //![screenshot](/repo/dittner/movie/img/crash1.jpg)
  [/^!\[([^\]]+)\]\(([^)]+)\)\(([^)]+)\)\n?/gm, '<img alt="$1" src="http://127.0.0.1:5005/api/asset$2"/><p class="md-legend">$3</p>'],
  [/^!\[([^\]]+)\]\(([^)]+)\)\n?/gm, '<img alt="$1" src="http://127.0.0.1:5005/api/asset$2"/>\n'],

  //links
  [/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>'],


  //headers
  [/\$?#{6} +(.+)\n?/gm, '<h6>$1</h6>'],
  [/\$?#{5} +(.+)\n?/gm, '<h5>$1</h5>'],
  [/\$?#{4} +(.+)\n?/gm, '<h4>$1</h4>'],
  [/\$?#{3} +(.+)\n?/gm, '<h3>$1</h3>'],
  [/\$?#{2} +(.+)\n?/gm, '<h2>$1</h2>'],
  [/\$?#{1} +(.+)\n?/gm, '<h1>$1</h1>'],


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
  [/\n/g, '<br/>'],
]

interface MarkdownTextProps extends LabelProps {
  replaceEmTagWithCode?: boolean
}

export const MarkdownText = (props: MarkdownTextProps) => {
  const theme = themeManager.theme
  let className = 'className' in props ? props.className + ' ' : ''
  className += theme.id + ' ' + buildClassName(props)
  let html = props.text ?? ''
  let blocks = html.replace(/^```code\s*\n(((?!```)(.|\n))+)\n```\n?/gm, '<CODE>$1<CODE>').split('<CODE>')

  blocks = blocks.map((b, i) => {
    if (i % 2 !== 0) {
      return highlightMultilineCode(b, theme)
    } else {
      let res = mdToTags(b)
      if (props.replaceEmTagWithCode) return res
      res = res.split(/<em>|<\/em>/).map((s, j) => {
        if (j % 2 !== 0) {
          return '<code>' + s.replace(/<b>|<\/b>/g, '__').replace(/<i>|<\/i>/g, '_') + '</code>'
        } else {
          return s
        }
      }).join('')
      return res
    }
  })

  return <div className={className} dangerouslySetInnerHTML={{ __html: blocks.join('') }} />
}

const highlightMultilineCode = (code: string, t: GlobalTheme): string => {
  return '<pre class="code-' + t.id + '"><code class="md-' + t.id + '">' + highlight(code) + '</code></pre>'
}

const mdToTags = (code: string): string => {
  let res = code
  rules.forEach((item) => {
    res = res.replace(item[0], item[1])
  })
  return res
}

export const grammar = new Grammar()
const highlight = (code: string): string => {
  let tokenRoot = grammar.tokenize(code)
  return htmlize(tokenRoot)
}

const htmlize = (root: MDToken): string => {
  let res = ''
  let t: MDToken | undefined = root
  while (t) {
    const text = t.value
    if (text.length === 0) return ''
    switch (t.lex) {
      case Lexema.LineBreak: res += text; break
      case Lexema.Number: res += '<span class="num">' + text + '</span>'; break
      case Lexema.Operator: res += '<span class="op">' + text.replace(/</g, '&lt;') + '</span>'; break
      case Lexema.String: res += '<span class="str">' + text + '</span>'; break
      case Lexema.Comment: res += '<span class="cmt">' + text + '</span>'; break
      case Lexema.Regex: res += '<span class="rx">' + text + '</span>'; break
      case Lexema.Keyword: res += '<span class="kw">' + text + '</span>'; break
      case Lexema.Class: res += '<span class="cl">' + text + '</span>'; break
      case Lexema.Function: res += '<span class="fn">' + text + '</span>'; break
      case Lexema.Decorator: res += '<span class="dec">' + text + '</span>'; break
      case Lexema.Tag: res += '<span class="tag">' + text + '</span>'; break
      case Lexema.Empty: break
      default: res += text
    }
    t = t.next()
  }
  return res
}