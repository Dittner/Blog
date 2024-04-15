import { uid } from '../domain/UIDGenerator'
import { Observable, observe } from 'react-observable-mutations'
import { buildRule, type StylableComponentProps } from 'react-nocss'

export interface GlobalTheme {
  id: string
  isLight: boolean
  defFontSize: string
  defFontWeight: string
  appBg: string
  headerBgColor: string
  controlLinkColor: string
  controlLinkSelectedColor: string
  white: string
  black: string
  black05: string
  black10: string
  black25: string
  black50: string
  black75: string
  header: string
  text: string
  text50: string
  orange: string
  red: string
  olive: string
  gray: string
  green: string
  blue: string
  pink: string
  purple: string
  violet: string
  panelBg: string
  separator: string
  transparent: string
  code: string
  search: string
  maxBlogTextWidth: string
  maxBlogTextWidthPx: number
  maxBookTextWidth: string
  maxBookTextWidthPx: number
  maxContentWidth: string
  maxContentWidthPx: number
  //docs
  selectedBlockBg: string
  border: string
  error: string
  link: string
  linkHover: string
  prevNextPageBtnBg: string
  docLink: string
  docLinkIcon: string
  docLinkHovered: string
  docLinkBgHovered: string
  docLinkSelected: string
  docLinkBgSelected: string
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
    this.uid = uid()

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
    return {
      id: 'light',
      isLight: true,
      defFontSize: '1.2rem',
      defFontWeight: '400',
      appBg: white,
      headerBgColor: '#24292c',
      controlLinkColor: '#c5781f',
      controlLinkSelectedColor: '#ffFFff',
      white,
      orange: '#a56a26',
      black05: black + '05',
      black10: black + '10',
      black25: black + '44',
      black50: black + '88',
      black75: black + 'CC',
      black,
      header: black,
      text: black,
      text50: black + '88',
      red: '#95353d',
      olive: '#ab9b4d',
      gray: '#8a9fb6',
      green: '#7198a9',
      blue: '#084891',
      pink: '#9434a6',
      purple: '#551fd9',
      violet: '#48356a',
      panelBg: '#e6e6e7',
      separator: '#283238',
      transparent: '#00000000',
      code: '#244b5e',
      search: '#DC9B30',
      maxBlogTextWidth: '650px',
      maxBlogTextWidthPx: 650,
      maxBookTextWidth: '900px',
      maxBookTextWidthPx: 900,
      maxContentWidth: '1400px',
      maxContentWidthPx: 1400,
      //docs
      border: black + '10',
      error: '#ff719a',
      link: '#1a5369',
      linkHover: black,
      selectedBlockBg: '#88397b20',
      prevNextPageBtnBg: '#652664',
      docLink: black,
      docLinkIcon: black,
      docLinkHovered: black,
      docLinkBgHovered: '#396f8810',
      docLinkSelected: '#9434a6',
      docLinkBgSelected: '#00000000'
    }
  }

  /*
  *
  * DARK THEME
  *
  * */

  createDarkTheme(t: GlobalTheme): GlobalTheme {
    const green = '#abb4bc' //abc3d0
    return Object.assign({}, t, {
      id: 'dark',
      isLight: false,
      appBg: '#25262f',
      header: '#d1dae1',
      text: green,
      text50: green + '88',
      red: '#d05f68',
      gray: '#778594',
      border: '#ffFFff10',
      blue: '#2b79d7',
      violet: '#6b4f9d',
      //docs
      link: '#6eaac0',
      code: '#ccdbe8',
      docLink: green + '88',
      docLinkIcon: green,
      docLinkHovered: green,
      docLinkBgHovered: green + '10',
      docLinkSelected: green
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
      textTransform: 'capitalize',
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
      fontSize: '1.25rem',
      fontWeight: '500',
      textColor: t.pink
    }
    buildRule(h5Props, parentSelector, 'h5')

    const h6Props: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: '1.25rem',
      fontWeight: '500',
      textColor: t.purple
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
      fontWeight: '600',
      textColor
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

    const inlineCodeProps: StylableComponentProps = {
      fontFamily: monoFont,
      fontSize: t.defFontSize,
      textColor: t.code
    }
    buildRule(inlineCodeProps, parentSelector, 'code')
    inlineCodeProps.textColor = t.search

    buildRule({
      fontFamily: articleFont,
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      bgColor: t.search,
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

    const blockquoteProps: StylableComponentProps = {
      fontFamily: articleFont,
      fontWeight: t.defFontWeight,
      bgColor: t.text + '07',
      padding: '50px'
    }
    buildRule(blockquoteProps, parentSelector, 'blockquote')
  }
}

export const themeManager = new ThemeManager()

export function observeThemeManager(): ThemeManager {
  return observe(themeManager)
}
