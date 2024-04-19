import { uid } from '../domain/UIDGenerator'
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
  orange: string
  red: string
  gray: string
  green: string
  blue: string
  pink: string
  purple: string
  violet: string
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
      red,
      gray: '#8a9fb6',
      green: '#7198a9',
      blue: '#084891',
      pink: '#c7accc',
      purple: '#7577ff',
      violet: '#43257c',
      transparent: '#00000000',
      menuItem: black + '88',
      menuHoveredItem: black,
      menuSelectedItem: black,
      maxBlogTextWidth: '850px',
      maxBlogTextWidthPx: 850
    }
  }

  /*
  *
  * DARK THEME
  *
  * */

  createDarkTheme(t: GlobalTheme): GlobalTheme {
    const text = '#96a2ac' //abc3d0
    const white = '#c4ced6'
    const red = '#d05f8e'
    return Object.assign({}, t, {
      id: 'dark',
      isLight: false,
      appBg: '#1d1e23', //1b1c21
      white,
      header: white,
      text,
      text50: text + '88',
      red,
      gray: '#79848d',
      green: '#445b65',
      border: '#ffFFff10',
      blue: '#2b79d7',
      violet: '#aeadde',
      pink: '#c293cc',
      orange: '#ffa948',
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
      textColor: t.isLight ? textColor : '#b8c6d1'
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

    const blockquoteChildrenProps: StylableComponentProps = {
      fontSize: t.defFontSize,
      textAlign: 'left',
      textColor: t.isLight ? t.violet : t.violet
    }
    buildRule(blockquoteChildrenProps, parentSelector, 'blockquote p')
    blockquoteChildrenProps.textAlign = 'right'
    blockquoteChildrenProps.paddingTop = '20px'
    buildRule(blockquoteChildrenProps, parentSelector, 'blockquote h4')

    const blockquoteProps: StylableComponentProps = {
      paddingVertical: '20px'
    }
    buildRule(blockquoteProps, parentSelector, 'blockquote')

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
