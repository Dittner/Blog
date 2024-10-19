import {generateUID} from '../domain/UIDGenerator'
import {buildRule, type StylableComponentProps} from 'react-nocss'
import {RXObservableEntity} from '../../lib/rx/RXPublisher'
import {observe} from '../../lib/rx/RXObserver'

export interface GlobalTheme {
  id: string
  isLight: boolean
  defFontSize: string
  defFontWeight: string
  appBg: string
  white: string
  black: string
  header: string
  text: string
  text50: string
  editorText: string
  orange: string
  red: string
  gray: string
  green: string
  mark: string
  blue: string
  pink: string
  purple: string
  violet: string
  quote: string
  selectedBlockBg: string
  modalViewBg: string
  transparent: string
  menuItem: string
  menuHoveredItem: string
  menuSelectedItem: string
  maxBlogTextWidth: string
  maxBlogTextWidthPx: number
  menuWidthPx: number
}

export class ThemeManager extends RXObservableEntity<ThemeManager> {
  readonly uid

  private readonly _lightTheme: GlobalTheme
  private readonly _darkTheme: GlobalTheme

  //--------------------------------------
  //  globalTheme
  //--------------------------------------
  private _theme: GlobalTheme
  get theme(): GlobalTheme {
    return this._theme
  }

  setLightTheme() {
    this._theme = this._lightTheme
    const html = document.querySelector('html')
    if (html) {
      html.style.colorScheme = 'dark'
      html.style.backgroundColor = this.theme.appBg
    }
    window.localStorage.setItem('theme', 'light')
    this.mutated()
  }

  setDarkTheme() {
    this._theme = this._darkTheme
    const html = document.querySelector('html')
    if (html) {
      html.style.colorScheme = 'dark'
      html.style.backgroundColor = this.theme.appBg
    }
    window.localStorage.setItem('theme', 'dark')
    this.mutated()
  }

  constructor() {
    super()
    this.uid = generateUID()

    this._lightTheme = this.createLightTheme()
    this._darkTheme = this.createDarkTheme(this._lightTheme)
    this._theme = this._lightTheme

    this.buildThemeSelectors(this._lightTheme)
    this.buildThemeSelectors(this._darkTheme)

    const theme = window.localStorage.getItem('theme') ?? 'light'
    if (theme === 'light') {
      this.setLightTheme()
    } else {
      this.setDarkTheme()
    }
  }

  /*
  *
  * LIGHT THEME
  *
  * */

  createLightTheme(): GlobalTheme {
    const black = '#111111'
    const white = '#efeee8'//e9eeef
    const red = '#93324f'
    return {
      id: 'light',
      isLight: true,
      defFontSize: '1.5rem',
      defFontWeight: '400',
      appBg: white,
      white,
      orange: '#a56a26',
      black,
      header: black,
      text: black,
      text50: black + '88',
      editorText: black,
      red,
      gray: '#8a9fb6',
      green: '#7198a9',
      mark: '#a7e0b9',
      blue: '#084891',
      pink: '#c7accc',
      purple: '#d5caf2',
      violet: '#43257c',
      quote: '#58317c',
      selectedBlockBg: black + '10',
      modalViewBg: '#e5d8f1',
      transparent: '#00000000',
      menuItem: black + 'aa',
      menuHoveredItem: red,
      menuSelectedItem: black,
      maxBlogTextWidth: '950px',
      maxBlogTextWidthPx: 950,
      menuWidthPx: 500
    }
  }

  /*
  *
  * DARK THEME
  *
  * */

  createDarkTheme(t: GlobalTheme): GlobalTheme {
    const text = '#aab6c2' //aab6c2
    const white = '#c6d4e3'
    const red = '#df5f83'
    return Object.assign({}, t, {
      id: 'dark',
      isLight: false,
      appBg: '#262730', //131417 262730
      white,
      header: white,
      text,
      text50: text + '88',
      editorText: '#9a9696',
      red,
      gray: '#79848d',
      green: '#6c8f9f',
      mark: '#bbd09e',
      border: '#ffFFff10',
      blue: '#5e98de',
      violet: '#aeadde',
      purple: '#b2aee5',
      quote: '#9f8cb1',
      pink: '#c293cc',
      orange: '#463d16',
      selectedBlockBg: text + '10',
      modalViewBg: '#43354b',
      menuItem: text + '88',
      menuHoveredItem: red,
      menuSelectedItem: white
    })
  }

  buildThemeSelectors(t: GlobalTheme) {
    const parentSelector = t.id
    const monoFont = 'var(--font-family-mono)'
    const articleFont = 'var(--font-family-article)'
    const font = 'var(--font-family)'
    const textColor = t.text
    const textHeaderColor = t.header
    // const textProps: StylableComponentProps = { textColor: '#86b3c7' }
    // buildRule(textProps, theme.id, '*')

    const h1Props: StylableComponentProps = {
      fontFamily: articleFont,
      textTransform: 'uppercase',
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textColor: textHeaderColor
    }
    buildRule(h1Props, parentSelector, 'h1')

    const h2Props: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: '1.75rem',
      fontWeight: 'bold',
      paddingTop: '50px',
      paddingBottom: '20px',
      textColor: textHeaderColor
    }
    buildRule(h2Props, parentSelector, 'h2')

    const h3Props: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: t.defFontSize,
      fontWeight: 'bold',
      textAlign: 'left',
      textColor: textHeaderColor
    }
    buildRule(h3Props, parentSelector, 'h3')

    const h4Props: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: t.defFontSize,
      fontWeight: 'bold',
      textAlign: 'left',
      textColor: textHeaderColor
    }
    buildRule(h4Props, parentSelector, 'h4')

    const h5Props: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: t.defFontSize,
      fontWeight: 'bold',
      textColor
    }
    buildRule(h5Props, parentSelector, 'h5')

    const h6Props: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: '0.8rem',
      fontWeight: t.defFontWeight,
      textColor: t.text50
    }
    buildRule(h6Props, parentSelector, 'h6')

    const pProps: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      //textIndent: '2rem',
      paddingTop: t.defFontSize,
      textColor
    }
    buildRule(pProps, parentSelector, 'p')

    const boldProps: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: t.defFontSize,
      fontWeight: t.isLight ? 'bold' : t.defFontWeight,
      textColor: t.isLight ? textColor : t.header
    }
    buildRule(boldProps, parentSelector, 'strong')
    buildRule(boldProps, parentSelector, 'b')

    const globalProps: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      textColor
    }
    buildRule(globalProps, parentSelector, 'div')
    buildRule(globalProps, parentSelector, 'span')

    buildRule(globalProps, parentSelector, 'li')

    globalProps.fontStyle = 'italic'
    globalProps.fontWeight = undefined
    buildRule(globalProps, parentSelector, 'i')
    buildRule(globalProps, parentSelector, 'em')

    //we are using this rule as selection
    const codeProps: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: t.defFontSize,
      bgColor: t.mark,
      textColor: t.isLight ? textColor : t.black,
      paddingVertical: '5px'
    }
    buildRule(codeProps, parentSelector, 'code')

    buildRule({
      fontFamily: articleFont,
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      bgColor: '#ffFF00',
      textColor
    }, parentSelector, 'mark')

    buildRule({
      //fontFamily: font,
      fontSize: '1.5rem',
      textColor: textHeaderColor
    }, parentSelector, 'mjx-math')

    const linkProps: StylableComponentProps = {
      fontFamily: monoFont,
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      textColor: t.blue
    }
    buildRule(linkProps, parentSelector, 'a:link')
    buildRule(linkProps, parentSelector, 'a:visited')
    buildRule(linkProps, parentSelector, 'a:active')
    linkProps.textDecoration = 'underline'
    buildRule(linkProps, parentSelector, 'a:hover')

    const blockquoteContentProps: StylableComponentProps = {
      paddingVertical: '10px',
      paddingLeft: '60px',
      borderLeft: '1px solid ' + t.quote
    }
    buildRule(blockquoteContentProps, parentSelector, 'blockquote')

    const blockquoteTextProps: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: t.defFontSize,
      fontStyle: 'italic',
      textColor
    }
    buildRule(blockquoteTextProps, parentSelector, 'blockquote p')

    const blockquoteAuthorProps: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: t.defFontSize,
      textColor
    }
    buildRule(blockquoteAuthorProps, parentSelector, 'blockquote h4')

    // const blockquoteProps: StylableComponentProps = {
    //   paddingVertical: '20px'
    // }
    // buildRule(blockquoteProps, parentSelector, 'blockquote')

    const imgProps: StylableComponentProps = {
      maxWidth: (t.maxBlogTextWidthPx + 200) + 'px',
      paddingTop: '50px'
    }
    buildRule(imgProps, parentSelector, 'img')
  }
}

export const themeManager = new ThemeManager()

export function observeThemeManager(): ThemeManager {
  return observe(themeManager)
}
