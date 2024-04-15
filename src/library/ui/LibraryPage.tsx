import React, { useEffect } from 'react'
import { LayoutLayer } from '../../global/application/Application'
import { observe, observer } from 'react-observable-mutations'
import { useNavigate, useParams } from 'react-router-dom'
import { HStack, Image, Label, Rectangle, Spacer, stylable, VStack } from 'react-nocss'
import { NavBar, NavBarLink } from '../../global/ui/common/NavBar'
import { useLibraryContext, useWindowSize } from '../../App'
import { observeAuthorList } from '../LibraryContext'
import {
  type Author,
  type Book
} from '../domain/LibraryModel'
import { themeManager } from '../../global/application/ThemeManager'
import { MarkdownText } from '../../global/ui/common/MarkdownText'

export const LibraryPage = observer(() => {
  console.log('new LibraryPage')

  const theme = themeManager.theme
  useWindowSize()

  const contentOffset = (window.innerWidth - theme.maxContentWidthPx) / 2 - 5
  const authorListWidth = (theme.maxContentWidthPx - theme.maxBookTextWidthPx) / 2
  const HOR_PAD = window.innerWidth <= theme.maxContentWidthPx ? '20px' : '0'
  const SHOW_AUTHORS_LINKS = window.innerWidth >= theme.maxContentWidthPx

  const navBarLinks = Array.of<NavBarLink | string>(
    new NavBarLink('/library', 'Library'),
    '|',
    new NavBarLink('/blog', 'Blog'))

  return <VStack width='100%' minHeight='100vh'
                 paddingHorizontal={HOR_PAD}
                 halign='center' valign='top'>

    <NavBar links={navBarLinks}/>

    {/*<Rectangle width={theme.maxContentWidthPx + 20 + 'px'} height='100%'*/}
    {/*           bgColor={theme.text + '05'} position='fixed' top='0'/>*/}

    <HStack halign='center' valign='top'
            width='100%' maxWidth={theme.maxContentWidth}>
      {SHOW_AUTHORS_LINKS &&
        <AuthorListView position='fixed'
                        left={contentOffset + 'px'}
                        width={authorListWidth + 'px'}
                        layer={LayoutLayer.ONE}/>
      }

      <VStack halign='center' valign='center'
              layer={LayoutLayer.ONE}
              width='100%' maxWidth={theme.maxBookTextWidth}
              gap='80px'>

        <AuthorView/>
        <BookView/>

      </VStack>

      <BookListView position='fixed'
                    right={contentOffset + 'px'}
                    width={authorListWidth + 'px'}
                    layer={LayoutLayer.ONE}/>
    </HStack>
  </VStack>
})

const AuthorListView = observer(stylable(() => {
  console.log('new AuthorListView')
  const authorList = observeAuthorList()
  const { authorLoader } = useLibraryContext()
  const theme = themeManager.theme
  const navigate = useNavigate()

  const params = useParams()
  const selectedAuthorUID = params.authorUID
  const selectedAuthor = authorList.findAuthor(a => a.uid === selectedAuthorUID)

  useEffect(() => {
    authorLoader.loadAllAuthors().then()
  }, [])

  const selectAuthor = (a: Author) => {
    navigate('/library/' + a.uid)
  }

  return <VStack halign='left' valign='top'
                 gap='6px' width='100%'
                 paddingTop='175px'>

    {authorList.authors.map(author => {
      const isSelected = selectedAuthor?.uid === author.uid
      return <Label key={author.uid}
                    width='100%'
                    textColor={isSelected ? theme.text : theme.text50}
                    fontWeight={isSelected ? 'bold' : theme.defFontWeight}
                    text={author.shortName}
                    fontSize='0.8rem'
                    lineHeight='1.1'
                    onClick={() => {
                      selectAuthor(author)
                    }}
                    hoverState={state => {
                      state.textColor = theme.text
                      state.btnCursor = true
                    }}/>
    })}
  </VStack>
}))

const AuthorView = observer(() => {
  console.log('new AuthorView')
  const authorList = observeAuthorList()
  const params = useParams()
  const selectedAuthorUID = params.authorUID
  const selectedBookId = params.bookId
  const author = authorList.findAuthor(a => a.uid === selectedAuthorUID)
  observe(author)

  const theme = themeManager.theme

  if (!selectedAuthorUID) {
    return <Label width='100%' textAlign='center'
                  paddingTop={window.innerHeight / 2 - 50 + 'px'}
                  textColor={theme.text50}
                  text='Author not selected'
                  fontSize='0.8rem'/>
  }

  if (!author) {
    return <Label width='100%' textAlign='center'
                  paddingTop={window.innerHeight / 2 - 50 + 'px'}
                  textColor={theme.text}
                  text='Loading...'
                  fontSize='0.8rem'/>
  }

  if (selectedBookId) {
    return <></>
  }

  return (
    <VStack width="100%" height='100%'
            valign='top' halign='center'
            gap='40px'
            textColor={theme.text}
            padding='40px'
            layer={LayoutLayer.ONE}>

      <HStack width='100%' height='100%' valign='center'>
        <Image src={author.photoUrl}
               opacity='0.8'
               alt="Author image"
               height='300px'/>

        <VStack width='100%' height='100%' gap='0'>
          <Label width='100%' textAlign='center'
                 textColor='inherit'
                 text={author.fullName}
                 fontWeight='500'
                 fontSize='1.5rem'/>

          <Label width='100%' textAlign='center'
                 textColor='inherit'
                 text={'(' + author.birthYear + (author.deathYear ? '-' + author.deathYear : '') + ')'}/>
        </VStack>
      </HStack>

      <Label width='100%' textAlign='left'
             textColor='inherit'
             opacity='0.8'
             text={author.biography}/>
    </VStack>
  )
})

const BookListView = observer(stylable(() => {
  console.log('new BookListView')
  const authorList = observeAuthorList()
  const {
    bookLoader
  } = useLibraryContext()
  const theme = themeManager.theme
  useWindowSize()
  const navigate = useNavigate()

  const params = useParams()
  const selectedAuthorUID = params.authorUID
  const selectedBookId = params.bookId
  const selectedAuthor = authorList.findAuthor(a => a.uid === selectedAuthorUID)
  const selectedBook = selectedAuthor?.findBook(b => b.id === selectedBookId)
  if (selectedAuthor) observe(selectedAuthor)

  useEffect(() => {
    if (selectedAuthor) {
      bookLoader.loadAllBooks(selectedAuthor).then()
    }
  }, [selectedAuthor])

  const selectBook = (a: Author, b: Book) => {
    navigate('/library/' + a.uid + '/' + b.id)
    window.scrollTo(0, 0)
  }

  return <VStack halign='right' valign='top' gap='6px'
                 width='100%' height='100%'
                 paddingTop='175px'>

    {selectedAuthor?.books.map(book => {
      const isSelected = selectedBook?.id === book.id
      return <Label key={selectedAuthor.uid + '-' + book.id}
                    width='100%'
                    textAlign='right'
                    textColor={isSelected ? theme.text : theme.text50}
                    fontWeight={isSelected ? 'bold' : theme.defFontWeight}
                    text={book.year ? book.title + '. ' + book.year : book.title}
                    fontSize='0.8rem'
                    lineHeight='1.1'
                    onClick={() => {
                      selectBook(selectedAuthor, book)
                    }}
                    hoverState={state => {
                      state.textColor = theme.text
                      state.btnCursor = true
                    }}/>
    })}
  </VStack>
}))

const BookView = observer(() => {
  console.log('new BookView')
  const authorList = observeAuthorList()
  const params = useParams()
  const selectedAuthorUID = params.authorUID
  const selectedBookId = params.bookId
  const author = authorList.findAuthor(a => a.uid === selectedAuthorUID)
  observe(author)

  const book = author?.findBook(b => b.id === selectedBookId)
  const theme = themeManager.theme

  if (!book) {
    return <Spacer/>
  }

  return (
    <VStack textColor={theme.text}
            className='article'
            halign="right"
            valign="top"
            padding='40px'
            gap="20px"
            width="100%"
            layer={LayoutLayer.ONE}>

      <Label width='100%' textAlign='left'
             className='article'
             paddingVertical='40px'
             textColor={theme.header}
             fontWeight='bold'
             textTransform='uppercase'
             fontSize='2rem'
             text={book.title}/>

      <MarkdownText key={book.id}
                    width='100%'
                    text={book.markdown}/>

    </VStack>
  )
})
