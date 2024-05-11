import { generateUID } from '../domain/UIDGenerator'
import { Observable, observe } from 'react-observable-mutations'
import { buildRule, type StylableComponentProps } from 'react-nocss'

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
}

export class ThemeManager extends Observable {
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
    super('ThemeManager')
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
    const black = '#151a1c'
    const white = '#f5f6f7'
    const red = '#86244d'
    return {
      id: 'light',
      isLight: true,
      defFontSize: '1.25rem',
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
      blue: '#084891',
      pink: '#c7accc',
      purple: '#b09ae9',
      violet: '#43257c',
      quote: '#664a80',
      selectedBlockBg: '#88397b10',
      modalViewBg: '#e5d8f1',
      transparent: '#00000000',
      menuItem: black + '88',
      menuHoveredItem: black,
      menuSelectedItem: black,
      maxBlogTextWidth: '950px',
      maxBlogTextWidthPx: 950
    }
  }

  /*
  *
  * DARK THEME
  *
  * */

  createDarkTheme(t: GlobalTheme): GlobalTheme {
    const text = '#96a0ad' //abc3d0
    const white = '#b4c1d0'
    const red = '#d05f8e'
    return Object.assign({}, t, {
      id: 'dark',
      isLight: false,
      appBg: '#191a1d', //1b1c21
      white,
      header: white,
      text,
      text50: text + '88',
      editorText: '#7590a7',
      red,
      gray: '#79848d',
      green: '#6c8f9f',
      border: '#ffFFff10',
      blue: '#2b79d7',
      violet: '#aeadde',
      purple: '#321f60',
      quote: '#84a0b6',
      pink: '#c293cc',
      orange: '#84662f',
      modalViewBg: '#43354b',
      menuItem: text + '88',
      menuHoveredItem: white,
      menuSelectedItem: white
    })
  }

  buildThemeSelectors(t: GlobalTheme) {
    const parentSelector = t.id
    const monoFont = 'var(--font-family-mono)'
    const articleFont = 'var(--font-family-article)'
    const textColor = t.text
    const textHeaderColor = t.header
    // const textProps: StylableComponentProps = { textColor: '#86b3c7' }
    // buildRule(textProps, theme.id, '*')

    const h1Props: StylableComponentProps = {
      fontFamily: articleFont,
      textTransform: 'uppercase',
      fontSize: '2.5rem',
      fontWeight: '700',
      textColor: textHeaderColor
    }
    buildRule(h1Props, parentSelector, 'h1')

    const h2Props: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: '1.5rem',
      fontWeight: '600',
      paddingTop: '30px',
      textColor: textHeaderColor
    }
    buildRule(h2Props, parentSelector, 'h2')

    const h3Props: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: '1.25rem',
      fontWeight: '600',
      textAlign: 'center',
      textColor: textHeaderColor
    }
    buildRule(h3Props, parentSelector, 'h3')

    const h4Props: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: '1.25rem',
      fontWeight: '600',
      textAlign: 'right',
      textColor: textHeaderColor
    }
    buildRule(h4Props, parentSelector, 'h4')

    const h5Props: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: t.defFontSize,
      fontWeight: '600',
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
      textColor
    }
    buildRule(pProps, parentSelector, 'p')

    const boldProps: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: t.defFontSize,
      fontWeight: t.isLight ? '600' : t.defFontWeight,
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
    buildRule(globalProps, parentSelector, 'i')
    buildRule(globalProps, parentSelector, 'li')

    //we are using this rule as selection
    const codeProps: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: t.defFontSize,
      bgColor: t.purple,
      paddingVertical: '5px',
      textColor
    }
    buildRule(codeProps, parentSelector, 'code')

    buildRule({
      fontFamily: articleFont,
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      bgColor: '#ffFF00',
      textColor
    }, parentSelector, 'mark')

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
      bgColor: t.header + '05',
      borderColor: t.header + '10',
      cornerRadius: '10px',
      paddingHorizontal: '40px',
      paddingVertical: '20px',
      marginBottom: '20px'
    }
    buildRule(blockquoteContentProps, parentSelector, 'blockquote')

    const blockquoteTextProps: StylableComponentProps = {
      fontSize: t.defFontSize,
      textAlign: 'left',
      textColor: t.quote
    }
    buildRule(blockquoteTextProps, parentSelector, 'blockquote p')

    const blockquoteAuthorProps: StylableComponentProps = {
      fontSize: t.defFontSize,
      textAlign: 'right',
      textColor: t.quote
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
