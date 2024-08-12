import React, {useEffect} from 'react'
import {LayoutLayer} from '../../global/application/Application'
import {
  HStack,
  Image,
  Label,
  type LabelProps,
  LinkButton,
  type LinkButtonProps,
  Spacer,
  type StackProps,
  stylable,
  type StylableComponentProps,
  StylableContainer,
  TextArea,
  VStack
} from 'react-nocss'
import {NavBar} from '../../global/ui/NavBar'
import {useBlogContext, useWindowSize} from '../../App'
import {observeBlogMenu, observeEditor, observeUser} from '../BlogContext'
import {type Author, type Book, type Page} from '../domain/BlogModel'
import {themeManager} from '../../global/application/ThemeManager'
import {MarkdownText} from '../../global/ui/MarkdownText'
import {type JSX} from 'react/jsx-runtime'
import {observe, observer} from '../../lib/rx/RXObserver'

export const BlogPage = observer(() => {
  const user = observeUser()
  observe(user.selectedAuthor)
  const editor = observeEditor()

  console.log('new BlogPage, selectedBook:', user.selectedBook)
  const theme = themeManager.theme
  const {restApi} = useBlogContext()
  useWindowSize()
  const menuWidth = (window.innerWidth - theme.maxBlogTextWidthPx - 120) >> 1
  if (!user.selectedBook) editor.editMode = false

  useEffect(() => {
    if (user.selectedChapter === '') {
      window.scrollTo(0, 0)
    } else {
      const timerId = setTimeout(() => {
        const element = document.getElementById(user.selectedChapter)
        if (element) {
          const elementPos = Math.round(element.getBoundingClientRect().top + document.documentElement.scrollTop)
          // element.scrollIntoView();
          console.log('elementPos=', elementPos)
          window.scrollTo(0, elementPos)
        }
      }, 0)
      return () => {
        clearTimeout(timerId)
      }
    }
  }, [user.selectedBook, user.selectedChapter])

  if (!restApi.isServerRunning) {
    const title = `The server is not running.
To start the server, execute commands in the terminal:`
    const commands = `$ cd ../Blog
$ python3 run_server.py`
    return <VStack
      halign="center"
      valign="center"
      gap='20px'
      width="100%" height="100vh">
      <NavBar/>

      <Label
        text={title}
        textAlign='center'
        whiteSpace="pre"
        textColor={theme.text}
        fontSize='1.1rem'/>

      <Label
        text={commands}
        className='mono'
        minWidth='500px'
        textAlign='left'
        whiteSpace="pre"
        paddingVertical='10px'
        paddingHorizontal='20px'
        bgColor={theme.text + '10'}
        borderColor={theme.text + '20'}
        cornerRadius='8px'
        textColor={theme.header}
        fontSize='0.9rem'/>
    </VStack>
  }

  return <VStack width='100%' minHeight='100vh'
    halign='center' valign='top'>
    <NavBar/>

    <HStack halign='center' valign='top'
      gap='0'
      width='100%' height='100%'>
      {!editor.editMode &&
        <BlogMenuView
          className='listScrollbar'
          selectedAuthor={user.selectedAuthor}
          selectedBook={user.selectedBook}
          position='fixed'
          left='0' top='40px' bottom='0'
          width={menuWidth + 'px'}
          enableOwnScroller
          layer={LayoutLayer.ONE}/>
      }

      {editor.editMode && <>
        <Spacer width='50%'/>
        <EditorView width='50%' height='100vh'/>
      </>
      }

      <VStack halign={editor.editMode ? 'left' : 'center'} valign='center'
        layer={LayoutLayer.ZERO}
        width={editor.editMode ? '50%' : '100%'}
        height='100%'
        gap='80px'>

        {!user.selectedAuthor &&
          <Label width='100%' textAlign='center'
            paddingTop={window.innerHeight / 2 + 'px'}
            textColor={theme.text50}
            text='Author not selected'
            fontSize='0.8rem'/>
        }

        {user.selectedAuthor && !user.selectedBook &&
          <AuthorView author={user.selectedAuthor}/>
        }
        {user.selectedBook &&
          <BookView book={user.selectedBook}/>
        }
      </VStack>
    </HStack>
  </VStack>
})

export interface BlogMenuViewProps {
  selectedAuthor: Author | undefined
  selectedBook: Book | undefined
}

const MenuLinkBtn = (props: LinkButtonProps) => {
  return <LinkButton fontSize='0.9rem'
    lineHeight='1.1'
    {...props}/>
}

const BlogMenuView = observer(stylable((props: BlogMenuViewProps) => {
  console.log('new BlogMenuView')
  const authorList = observeUser()
  const blogMenu = observeBlogMenu()
  const theme = themeManager.theme
  const selectedAuthor = props.selectedAuthor
  const selectedBook = props.selectedBook

  if (!blogMenu.isShown) return <></>

  const links: JSX.Element[] = []
  authorList.authors.forEach(a => {
    const isAuthorSelected = selectedAuthor?.id === a.id
    const authorComponent = <MenuLinkBtn key={'menu-' + a.id}
      width='100%'
      textColor={isAuthorSelected && !selectedBook ? theme.menuSelectedItem : theme.menuItem}
      fontWeight={isAuthorSelected && !selectedBook ? 'bold' : theme.defFontWeight}
      title={a.shortName}
      link={'/repo/' + a.id}
      hoverState={state => {
        state.textColor = isAuthorSelected && !selectedBook ? theme.menuSelectedItem : theme.menuHoveredItem
        state.textDecoration = 'none'
      }}/>
    links.push(authorComponent)

    if (isAuthorSelected && selectedAuthor) {
      selectedAuthor.books.forEach(b => {
        const isBookSelected = selectedBook?.id === b.id
        const bookComponent = <MenuLinkBtn key={'menu-' + selectedAuthor.id + '-' + b.id}
          width='100%'
          paddingLeft='20px'
          textColor={isBookSelected ? theme.menuSelectedItem : theme.menuItem}
          fontWeight={isBookSelected ? 'bold' : theme.defFontWeight}
          title={b.year ? b.title + '. ' + b.year : b.title}
          link={'/repo/' + a.id + '/' + b.id}
          hoverState={state => {
            state.textColor = isBookSelected ? theme.menuSelectedItem : theme.menuHoveredItem
            state.textDecoration = 'none'
          }}/>

        links.push(bookComponent)
        if (isBookSelected) {
          links.push(<BookSubTitleListView key='bookList' book={b}/>)
        }
      })
    }
  })

  return <VStack
    width='100%'
    gap='5px'
    padding='20px'
    paddingBottom='40px'
    layer={LayoutLayer.MODAL}>
    {links}
  </VStack>
}))

export interface AuthorViewProps {
  author: Author
}

const AuthorView = observer((props: AuthorViewProps) => {
  console.log('new AuthorView')
  const theme = themeManager.theme
  const author = props.author
  return (
    <VStack
      width="100%"
      height='100%'
      maxWidth={theme.maxBlogTextWidth}
      valign='top' halign='center'
      gap='40px'
      bgColor={theme.text + '08'}
      textColor={theme.text}
      padding='40px'
      layer={LayoutLayer.ONE}>

      <HStack width='100%' height='100%' valign='center'>
        <Image
          src={author.photoUrl}
          opacity='0.8'
          alt="Author image"
          height='300px'/>

        <VStack width='100%' height='100%' gap='0'>
          <Label
            width='100%'
            textAlign='center'
            textColor={theme.header}
            text={author.fullName}
            fontWeight='500'
            fontSize='1.5rem'/>

          <Label
            width='100%'
            textAlign='center'
            textColor='inherit'
            text={'(' + author.birthYear + (author.deathYear ? '-' + author.deathYear : '') + ')'}/>
        </VStack>
      </HStack>

      <Label
        width='100%'
        textAlign='left'
        textColor='inherit'
        opacity='0.8'
        text={author.biography}/>
    </VStack>
  )
})

interface BookViewProps extends StackProps {
  book: Book
}

const BookView = observer((props: BookViewProps) => {
  const {book, ...style} = props
  console.log('new BookView')
  observe(book)
  const theme = themeManager.theme

  return (
    <VStack
      textColor={theme.text}
      className='article'
      valign="top"
      gap="20px"
      paddingBottom='50px'
      width="100%"
      maxWidth={theme.maxBlogTextWidth}
      {...style}>
      <BookTitle book={book}/>
      {book.cover &&
        <BookCover book={book}/>
      }

      <Spacer height='50px'/>

      {book.pages.map((page, index) => {
        return <PageView key={page.uid} page={page} index={index}/>
      })}

    </VStack>
  )
})

const SUBTITLE_SEARCH_REG = /#+ *(.+)/i
const BookSubTitleListView = (props: BookViewProps) => {
  const theme = themeManager.theme
  return <>
    {props.book.pages.map((p, index) => {
      if (!p.text.startsWith('#')) return null

      const res = p.text.match(SUBTITLE_SEARCH_REG)
      const h = res && res.length > 0 ? res[1] : ''

      return <MenuLinkBtn
        key={p.uid}
        width='100%'
        paddingLeft='40px'
        textColor={theme.blue}
        fontWeight={theme.defFontWeight}
        title={h}
        paddingBottom='2px'
        link={'/repo/' + props.book.author.id + '/' + props.book.id + '#' + index}
        hoverState={state => {
          state.textColor = theme.menuHoveredItem
          state.textDecoration = 'none'
        }}/>
    })}
  </>
}

const PageView = observer(({page, index}: { page: Page, index: number }) => {
  console.log('new PageView')
  const editor = observeEditor()
  observe(page)
  const theme = themeManager.theme

  const isSelected = editor.selectedPage === page

  const toggleSelection = (e: any) => {
    e.stopPropagation()
    editor.selectedPage = isSelected ? undefined : page
  }

  if (editor.editMode && isSelected) {
    return (<>
      <StylableContainer
        className={theme.id + ' notSelectable'}
        minHeight="30px"
        paddingRight="40px"
        paddingLeft="34px"
        width="100%"
        onMouseDown={toggleSelection}
        bgColor={theme.red + '10'}
        borderLeft={['6px', 'solid', theme.red]}>
        <MarkdownText text={page.text}/>
      </StylableContainer>
    </>
    )
  }

  if (editor.editMode) {
    return <StylableContainer
      className={theme.id + ' notSelectable'}
      minHeight="30px"
      paddingHorizontal="40px"
      width="100%"
      onMouseDown={toggleSelection}
      hoverState={state => {
        state.bgColor = theme.selectedBlockBg
      }}>
      <MarkdownText text={page.text}/>
    </StylableContainer>
  }

  return (
    <StylableContainer
      id={'#' + index}
      className={theme.id}
      minHeight="30px"
      paddingHorizontal="40px"
      width="100%">
      <MarkdownText width='100%' text={page.text}/>
    </StylableContainer>
  )
})

const BookTitle = observer((props: BookViewProps) => {
  const theme = themeManager.theme
  return (<VStack
    width='100%'
    minHeight={props.book.cover ? '100vh' : '0'}
    valign='top' halign='left'
    gap='30px' paddingHorizontal="40px"
    paddingVertical='50px'>

    {/*<Rectangle width='100%' height='100%'*/}
    {/*           layer={LayoutLayer.MINUS}*/}
    {/*           bgColor={theme.green + '50'}*/}
    {/*           left='0' top='0' position='absolute'/>*/}

    {/*<StylableContainer width='100vw'*/}
    {/*                   layer={LayoutLayer.MINUS}*/}
    {/*                   minHeight={props.book.cover ? '100vh' : '0'}*/}
    {/*                   bgImageSrc={'/bg.png'}*/}
    {/*                   bgImageRepeat='no-repeat'*/}
    {/*                   bgImageAttachment='scroll'*/}
    {/*                   bgImageSize='cover'*/}
    {/*                   position='absolute' opacity='0.5'*/}
    {/*                   top='0' left='0'/>*/}

    {props.book.genre === 'movie' &&
        <Label
          textColor={theme.header}
          padding='30px'
          width='100%' textAlign='center'>
          <span className="icon icon-film"/>
        </Label>
    }

    <Label
      width='100%'
      textAlign='left'
      className='article'
      textColor={theme.header}
      fontWeight='bold'
      textTransform='uppercase'
      letterSpacing='2px'
      fontSize='2.5rem'
      text={props.book.title}/>

    <BookAnnotation
      authorName={props.book.author.shortName}
      bookYear={props.book.year}
      textColor={theme.text50}/>

    <Label
      textAlign='left'
      className='article'
      textColor={theme.header}
      fontSize='1.1rem'
      text={props.book.about}/>
  </VStack>
  )
})

const BookCover = (props: BookViewProps) => {
  const {restApi} = useBlogContext()
  const theme = themeManager.theme
  const menuWidth = (window.innerWidth - theme.maxBlogTextWidthPx) >> 1
  return <Image
    containerWidth='100vw'
    overflow='hidden'
    width='100%'
    layer={LayoutLayer.MINUS}
    alt='Cover Image'
    src={restApi.baseUrl + '/assets' + props.book.cover}
    opacity='0.6' position='relative' left={-menuWidth + 'px'}/>
}

interface BookAnnotationProps extends LabelProps {
  authorName: string
  bookYear: string
}

const BookAnnotation = (props: BookAnnotationProps) => {
  return <Label
    className='article'
    fontSize='0.9rem'
    whiteSpace='nowrap'
    text={props.bookYear ? props.authorName + ', ' + props.bookYear : props.authorName}
    {...props}/>
}

export const EditorView = observer((props: StackProps) => {
  console.log('new EditorView')
  const editor = observeEditor()
  const theme = themeManager.theme

  return <HStack
    halign="left"
    valign="top"
    gap="0"
    bgColor={theme.appBg}
    borderRight={['1px', 'solid', theme.text + '20']}
    borderColor={theme.transparent}
    layer={LayoutLayer.ONE}
    position='fixed' left='0' top='0'
    {...props}>

    {editor.selectedPage &&
      <TextArea
        className='article listScrollbar'
        protocol={editor.inputTextBuffer}
        onChange={_ => {
          editor.inputTextChanged()
        }}
        disabled={!editor.selectedPage}
        disableHorizontalScroll
        width='100%' height='100%'
        textAlign='left'
        textColor={theme.text + '88'}
        borderColor='undefined'
        fontSize='1.2rem'
        caretColor={theme.isLight ? '#000000' : theme.red}
        bgColor={theme.appBg}
        padding="45px"
        focusState={(state: StylableComponentProps) => {
          state.textColor = theme.editorText
        }}
        keepFocus
        autoFocus/>
    }

  </HStack>
})
