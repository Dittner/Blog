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
  text: string
  text50: string
  editorText: string
  orange: string
  red: string
  gray: string
  green: string
  code: string
  blue: string
  pink: string
  purple: string
  violet: string
  comment: string
  selectedBlockBg: string
  hoveredBlockBg: string
  modalViewBg: string
  transparent: string
  menuItem: string
  h1: string
  h2: string
  h3: string
  h4: string
  h5: string
  h6: string
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
  private readonly _nightTheme: GlobalTheme

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

  setNightTheme() {
    this._theme = this._nightTheme
    const html = document.querySelector('html')
    if (html) {
      html.style.colorScheme = 'dark'
      html.style.backgroundColor = this.theme.appBg
    }
    window.localStorage.setItem('theme', 'night')
    this.mutated()
  }

  constructor() {
    super()
    this.uid = generateUID()

    this._lightTheme = this.createLightTheme()
    this._darkTheme = this.createDarkTheme(this._lightTheme)
    this._nightTheme = this.createNightTheme(this._lightTheme)
    this._theme = this._lightTheme

    this.buildThemeSelectors(this._lightTheme)
    this.buildThemeSelectors(this._darkTheme)
    this.buildThemeSelectors(this._nightTheme)

    const theme = window.localStorage.getItem('theme') ?? 'light'
    if (theme === 'light') {
      this.setLightTheme()
    } else if (theme === 'night') {
      this.setNightTheme()
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
    const header = '#755b54'
    return {
      id: 'light',
      isLight: true,
      defFontSize: '1.5rem',
      defFontWeight: '400',
      appBg: white,
      white,
      orange: '#a56a26',
      black,
      text: black,
      text50: black + '88',
      editorText: black,
      red,
      gray: '#8a9fb6',
      green: '#7198a9',
      h1: black,
      h2: header,
      h3: header,
      h4: header,
      h5: header,
      h6: black + '88',
      code: '#dfeae0',
      blue: '#0a4277',
      pink: '#c7accc',
      purple: '#d5caf2',
      violet: '#43257c',
      comment: '#0b6039',
      selectedBlockBg: red + '15',
      hoveredBlockBg: black + '15',
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
    const text = '#878586' //aab6c2
    const white = '#c6d4e3'
    const red = '#df5f83'
    const header = '#b1a496'
    return Object.assign({}, t, {
      id: 'dark',
      isLight: false,
      appBg: '#262730', //131417 262730
      white,
      text,
      text50: text + 'aa',
      editorText: text,
      red,
      gray: '#79848d',
      green: '#6c8f9f',
      h1: white,
      h2: header,
      h3: header,
      h4: header,
      h5: header,
      h6: text + '88',
      code: '#999999', //'#909fa0', c0bbbb
      border: '#ffFFff10',
      blue: '#5e98de',
      violet: '#aeadde',
      purple: '#b2aee5',
      comment: '#7ea3a5',
      pink: '#c293cc',
      orange: '#463d16',
      selectedBlockBg: text + '07',
      hoveredBlockBg: text + '10',
      modalViewBg: '#43354b',
      menuItem: white + '88',
      menuHoveredItem: red,
      menuSelectedItem: white
    })
  }

    /*
  *
  * NIGHT THEME
  *
  * */

    createNightTheme(t: GlobalTheme): GlobalTheme {
      const text = '#76787f' //aab6c2
      const white = '#c6d4e3'
      const red = '#df5f83'
      const header = '#b1a496'
      return Object.assign({}, t, {
        id: 'night',
        isLight: false,
        appBg: '#262730', //131417 262730
        white,
        text,
        text50: text + 'aa',
        editorText: text,
        red,
        gray: '#79848d',
        green: '#6c8f9f',
        h1: white,
        h2: header,
        h3: header,
        h4: header,
        h5: header,
        h6: text + '88',
        code: '#858083', //'#909fa0', c0bbbb
        border: '#ffFFff10',
        blue: '#5e98de',
        violet: '#aeadde',
        purple: '#b2aee5',
        comment: '#7ea3a5',
        pink: '#c293cc',
        orange: '#463d16',
        selectedBlockBg: text + '07',
        hoveredBlockBg: text + '10',
        modalViewBg: '#43354b',
        menuItem: white + '88',
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
    const headerPadingTop = '50px'
    // const textProps: StylableComponentProps = { textColor: '#86b3c7' }
    // buildRule(textProps, theme.id, '*')

    const h1Props: StylableComponentProps = {
      textTransform: 'uppercase',
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textColor: t.h1,
      paddingTop: headerPadingTop
    }
    buildRule(h1Props, parentSelector, 'h1')

    const h2Props: StylableComponentProps = {
      fontSize: '2.0rem',
      fontWeight: 'bold',
      textColor: t.h2,
      paddingTop: headerPadingTop
    }
    buildRule(h2Props, parentSelector, 'h2')

    const h3Props: StylableComponentProps = {
      fontSize: '2.0rem',
      fontWeight: 'bold',
      textAlign: 'left',
      textColor: t.h3,
      paddingTop: headerPadingTop
    }
    buildRule(h3Props, parentSelector, 'h3')

    const h4Props: StylableComponentProps = {
      fontSize: t.defFontSize,
      fontWeight: 'bold',
      textAlign: 'left',
      textColor: t.h4,
      paddingTop: headerPadingTop
    }
    buildRule(h4Props, parentSelector, 'h4')

    const h5Props: StylableComponentProps = {
      fontSize: t.defFontSize,
      fontStyle: 'italic',
      fontWeight: 'normal',
      textColor: t.h5
    }
    buildRule(h5Props, parentSelector, 'h5')

    const h6Props: StylableComponentProps = {
      fontSize: '1.2rem',
      fontWeight: t.defFontWeight,
      textColor: t.h6
    }
    buildRule(h6Props, parentSelector, 'h6')

    const pProps: StylableComponentProps = {
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      //textIndent: '2rem',
      //paddingTop: t.defFontSize,
      textColor
    }
    buildRule(pProps, parentSelector, 'p')

    const globalProps: StylableComponentProps = {
      fontFamily: articleFont,
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      textColor
    }
    buildRule(globalProps, parentSelector, 'div')
    buildRule(globalProps, parentSelector, 'span')

    const boldProps: StylableComponentProps = {
      fontSize: 'inherit',
      fontWeight: 'bold'
    }
    buildRule(boldProps, parentSelector, 'strong')
    buildRule(boldProps, parentSelector, 'b')

    const italicProps: StylableComponentProps = {
      fontSize: 'inherit',
      fontWeight: t.defFontWeight,
      fontStyle: 'italic'
    }
    buildRule(italicProps, parentSelector, 'i')
    buildRule(italicProps, parentSelector, 'em')

    //list
    const listItemProps: StylableComponentProps = {
      fontSize: 'inherit',
      fontWeight: t.defFontWeight
    }
    buildRule(listItemProps, parentSelector, 'li')

    const listProps: StylableComponentProps = {
      fontSize: 'inherit',
      fontWeight: t.defFontWeight,
      margin: '0px'
    }
    buildRule(listProps, parentSelector, 'ul')
    buildRule(listProps, parentSelector, 'ol')

    //we are using this rule as selection
    const codeProps: StylableComponentProps = {
      fontFamily: articleFont,
      bgColor: t.isLight ? t.code : 'undefined',
      textColor: t.isLight ? textColor : t.code,
      paddingVertical: '5px'
    }
    buildRule(codeProps, parentSelector, 'code')

    // const preCodeProps: StylableComponentProps = {
    //   fontFamily: 'Georgia',
    //   fontSize: t.defFontSize,
    //   // textAlign: 'center',
    //   bgColor: t.gray,
    //   textColor: t.isLight ? textColor : t.black,
    //   width: '100%',
    //   paddingHorizontal: '100px'
    // }
    // buildRule(preCodeProps, parentSelector, 'code.language-js')

    buildRule({
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      bgColor: '#ffFF00',
      textColor
    }, parentSelector, 'mark')

    buildRule({
      //fontFamily: font,
      fontSize: '1.5rem',
      textColor: t.h1
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
      //marginVertical: '20px',
      //paddingVertical: '10px',
      paddingHorizontal: '20px',
      //bgColor: '#e5f0df',
      borderLeft: '1px solid ' + t.comment + '88'
    }
    buildRule(blockquoteContentProps, parentSelector, 'blockquote')

    const blockquoteTextProps: StylableComponentProps = {
      fontSize: '1.3rem',
      textColor: t.comment
    }
    buildRule(blockquoteTextProps, parentSelector, 'blockquote p')
    buildRule(blockquoteTextProps, parentSelector, 'blockquote i')
    buildRule(blockquoteTextProps, parentSelector, 'blockquote em')
    buildRule(blockquoteTextProps, parentSelector, 'blockquote strong')

    // const blockquoteAuthorProps: StylableComponentProps = {
    //   fontFamily: articleFont,
    //   fontSize: t.defFontSize,
    //   textColor
    // }
    // buildRule(blockquoteAuthorProps, parentSelector, 'blockquote h4')

    // const blockquoteProps: StylableComponentProps = {
    //   paddingVertical: '20px'
    // }
    // buildRule(blockquoteProps, parentSelector, 'blockquote')

    const imgProps: StylableComponentProps = {
      maxWidth: (t.maxBlogTextWidthPx + 200) + 'px',
      paddingTop: '50px'
    }
    buildRule(imgProps, parentSelector, 'img')

    /*
    *
    * p with classname
    *
    * */
    //stars delim
    const delimProps: StylableComponentProps = {
      width: '100%',
      fontWeight: 'bold',
      paddingVertical: '0px',
      textAlign: 'center'
    }
    buildRule(delimProps, parentSelector, 'p.md-delim')

    //align center
    const pCenterProps: StylableComponentProps = {
      width: '100%',
      textAlign: 'center',
      fontWeight: 'inherit',
      fontSize: 'inherit',
      textColor: 'inherit'
    }
    buildRule(pCenterProps, parentSelector, 'p.md-center')

    //align right
    const pRightProps: StylableComponentProps = {
      width: '100%',
      textAlign: 'right',
      fontWeight: 'inherit',
      fontSize: 'inherit',
      textColor: 'inherit'
    }
    buildRule(pRightProps, parentSelector, 'p.md-right')

    /*
    *
    * div with classname
    *
    * */

    //poem
    const poemProps: any = {
      textColor: 'inherit',
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: '50px',
      fontSize: '1.3rem'
    }
    buildRule(poemProps, parentSelector, 'div.poem')
    buildRule({fontSize: 'inherit', textColor: 'inherit'}, parentSelector, 'div.poem div')
    //note
    const noteProps: StylableComponentProps = {
      width: '100%',
      fontSize: '1.3rem',
      fontWeight: t.defFontWeight,
      textColor: t.text,
      paddingHorizontal: '20px',
      //bgColor: '#e5f0df',
      borderLeft: '1px solid ' + t.text50
    }
    buildRule(noteProps, parentSelector, 'div.note')
    buildRule({fontSize: 'inherit', textColor: 'inherit'}, parentSelector, 'div.note div')
    //epigraph
    const epigraphProps: any = {
      width: '100%',
      fontSize: '1.3rem',
      paddingLeft: '50%',
      flexDirection: 'row',
      justifyContent: 'right',
      textAlign: 'left',
      fontWeight: 'inherit',
      textColor: t.h2
    }
    buildRule(epigraphProps, parentSelector, 'div.epi')
    buildRule({fontSize: 'inherit', textColor: 'inherit'}, parentSelector, 'div.epi div')
    //textAlign center
    const centerProps: StylableComponentProps = {
      width: '100%',
      fontSize: '1.3rem',
      fontWeight: t.defFontWeight,
      textAlign: 'center',
      textColor: 'inherit'
    }
    buildRule(centerProps, parentSelector, 'div.center')
    buildRule({fontSize: 'inherit', textColor: 'inherit'}, parentSelector, 'div.center div')
  }
}

export const themeManager = new ThemeManager()

export function observeThemeManager(): ThemeManager {
  return observe(themeManager)
}
