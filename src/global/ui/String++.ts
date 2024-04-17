export const loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

export function regexIndexOf(text: string, rgx: RegExp, beginAt: number = 0) {
  const index = text.substring(beginAt || 0).search(rgx)
  return (index >= 0) ? (index + beginAt) : index
}

function parseLang(code: string): string {
  const found = code.match(/^```([a-zA-Z]+) */)
  return found && found.length > 1 ? found[1] : ''
}

export function formatIfTextIsCode(text: string): string {
  let textBeforeCode = ''
  let textAfterCode = ''
  const startCodeInd = regexIndexOf(text, /```[a-zA-Z]+\n+/)
  if (startCodeInd !== -1) {
    let endCodeInd = text.indexOf('```', startCodeInd + 3)
    if (endCodeInd === -1) {
      textAfterCode = '\n```'
      endCodeInd = text.length
    }

    if (startCodeInd !== 0) {
      textBeforeCode = text.slice(0, startCodeInd)
    }

    const code = text.slice(startCodeInd, endCodeInd)
    const lang = parseLang(code)
    const checkXMLTags = lang === 'jsx' || lang === 'tsx' || lang === 'xml' || lang === 'html'
    const res = formatCode(code, checkXMLTags)
    return endCodeInd !== text.length ? textBeforeCode + res + formatIfTextIsCode(text.slice(endCodeInd)) + textAfterCode : textBeforeCode + res + textAfterCode
  } else {
    return text
  }
}

export function formatCode(code: string, checkXMLTags: boolean = false): string {
  const debug = false
  let res = ''
  const length = code.length
  let isComment = false
  let indents = 0
  let buffer = ''
  let bufferIndents = 0
  for (let i = 0; i < length; i++) {
    const char = code.at(i)
    if (checkXMLTags && char === '<' && (i < length - 1) && code.at(i + 1) === '/') {
      bufferIndents--
      i++
      buffer += char
      buffer += code.at(i)
    } else if (checkXMLTags && char === '<' && (i < length - 1) && code.at(i + 1) !== ' ' && (buffer.length === 0 || code.at(i - 1) === ' ')) {
      buffer += char
      if (!isComment) bufferIndents++
    } else if (checkXMLTags && char === '/' && (i < length - 1) && code.at(i + 1) === '>') {
      if (!isComment) bufferIndents--
      buffer += char
    } else if (char === '/' && buffer === '' && (i < length - 1) && code.at(i + 1) === '/') {
      isComment = true
      buffer += char
    } else if (char === '(' || char === '{' || char === '[') {
      buffer += char
      if (!isComment) bufferIndents++
    } else if (char === ')' || char === '}' || char === ']') {
      if (!isComment) bufferIndents--
      buffer += char
    } else if (char === '\n') {
      let lineIndent = bufferIndents < 0 ? indents + bufferIndents : indents
      lineIndent = lineIndent < 0 ? 0 : lineIndent

      res += '  '.repeat(lineIndent) + buffer + '\n'
      if (debug) {
        res += '//' + 'lineIndent:' + lineIndent + ', indents:' + indents + ', bufferIndents:' + bufferIndents + '\n\n'
      }

      indents += bufferIndents
      indents = indents < 0 ? 0 : indents
      buffer = ''
      bufferIndents = 0
      isComment = false
    } else if (char === ' ' && buffer.length === 0) {
      buffer += ''
    } else {
      buffer += char
    }
  }
  res += buffer
  res = removeExtraSpaces(res)
  if (checkXMLTags) {
    res = alignXMLProps(res)
  }
  
  return res
}

function removeExtraSpaces(code: string): string {
  let res = ''
  let amountOfBlocks = 0
  let prevSpaces = 0
  let isParentIfConditionOrForLoop = false
  const rows = code.split('\n')
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r]
    let spaces = 0
    for (let i = 0; i < row.length; i++) {
      if (row.at(i) === ' ') {
        spaces++
      } else {
        break
      }
    }
    if (spaces > 0 && spaces === row.length) {
      res += '  '.repeat(amountOfBlocks) + row.slice(spaces)
      if (r < rows.length - 1) res += '\n'
      continue
    }

    if (spaces < prevSpaces) {
      amountOfBlocks--
      if (amountOfBlocks < 0) amountOfBlocks = 0
    } else if (spaces > prevSpaces) {
      amountOfBlocks++
    } else if (isParentIfConditionOrForLoop) {
      res += '  '
    }

    res += '  '.repeat(amountOfBlocks) + row.slice(spaces)
    if (r < rows.length - 1) res += '\n'

    isParentIfConditionOrForLoop = /^ *(if|for|else if) *\(/.test(row) && /\) *$/.test(row)
    isParentIfConditionOrForLoop = isParentIfConditionOrForLoop || /^ *else *$/.test(row)
    prevSpaces = spaces
  }
  return res
}

export const calcSpaceBefore = (row: string): number => {
  if (!row) return 0
  const rgx = /[^ ]+/
  return regexIndexOf(row, rgx, 0)
}

const hasOpenedClosedTags = (row: string): boolean => {
  if (!row) return false
  const rgx = /(<[a-zA-Z\/])|([a-zA-Z\/}\])'"] *>)/
  return rgx.test(row)
}

function alignXMLProps(code: string): string {
  let res = ''
  const onlyOpenedTag = /<[a-zA-Z]+ +[a-zA-Z]+/
  let hasOpenedTag = false
  let openedTagIndex = -1
  let firstSpaceIndexAfterOpenedTag = -1
  let amountOfBlocks = 0
  let prevSpaces = 0

  const rows = code.split('\n')
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r]
    if (!row) {
      if (r < rows.length - 1) res += '\n'
      continue
    }
    if (hasOpenedTag && firstSpaceIndexAfterOpenedTag !== -1) {
      const spaces = calcSpaceBefore(row)
      if (prevSpaces < 0) prevSpaces = spaces
      if (spaces > prevSpaces) amountOfBlocks++
      else if (spaces < prevSpaces && amountOfBlocks > 0) amountOfBlocks--
      prevSpaces = spaces

      res += ' '.repeat(firstSpaceIndexAfterOpenedTag + 1) + '  '.repeat(amountOfBlocks) + row.slice(spaces)
      if (hasOpenedClosedTags(row)) hasOpenedTag = false
    } else {
      res += row
      openedTagIndex = regexIndexOf(row, onlyOpenedTag, 0)
      hasOpenedTag = openedTagIndex !== -1 && !row.includes('>', openedTagIndex)
      firstSpaceIndexAfterOpenedTag = row.indexOf(' ', openedTagIndex)
      amountOfBlocks = 0
      prevSpaces = -1
    }

    if (r < rows.length - 1) res += '\n'
  }
  return res
}
