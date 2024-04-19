import React, { useEffect } from 'react'
import { LayoutLayer } from '../../global/application/Application'
import { observe, observer } from 'react-observable-mutations'
import { useParams } from 'react-router-dom'
import {
  HStack,
  Image,
  Label, type LabelProps, LinkButton,
  type LinkButtonProps,
  Spacer,
  stylable,
  StylableContainer,
  VStack
} from 'react-nocss'
import { NavBar } from '../../global/ui/NavBar'
import { useBlogContext } from '../../App'
import { observeAuthorList, observeBlogMenu } from '../BlogContext'
import {
  type Author,
  type Book
} from '../domain/BlogModel'
import { themeManager } from '../../global/application/ThemeManager'
import { MarkdownText } from '../../global/ui/MarkdownText'

export const BlogPage = observer(() => {
  console.log('new BlogPage')
  const theme = themeManager.theme
  const { authorLoader, bookLoader } = useBlogContext()
  const authorList = observe(useBlogContext().authorList)

  const params = useParams()
  const selectedAuthorId = params.authorId
  const selectedBookId = params.bookId
  const selectedAuthor = authorList.findAuthor(a => a.uid === selectedAuthorId)
  const selectedBook = selectedAuthor?.findBook(b => b.id === selectedBookId)
  if (selectedAuthor) observe(selectedAuthor)
  const menuWidth = (window.innerWidth - theme.maxBlogTextWidthPx - 120) >> 1

  useEffect(() => {
    if (selectedAuthor) {
      bookLoader.loadAllBooks(selectedAuthor).then()
    }
  }, [selectedAuthor])

  useEffect(() => {
    authorLoader.loadAllAuthors().then()
  }, [])

  return <VStack width='100%' minHeight='100vh'
                 paddingHorizontal='20px'
                 halign='center' valign='top'>
    <NavBar/>

    <HStack halign='center' valign='top'
            width='100%' height='100%'>
      <BlogMenuView selectedAuthor={selectedAuthor}
                    selectedBook={selectedBook}
                    position='fixed'
                    left='0' top='0' bottom='0'
                    width={menuWidth + 'px'}
                    layer={LayoutLayer.ONE}/>

      <VStack halign='center' valign='center'
              layer={LayoutLayer.ZERO}
              width='100%' maxWidth={theme.maxBlogTextWidth}
              height='100%' paddingBottom='50px'
              gap='80px'>

        {!selectedAuthor &&
          <Label width='100%' textAlign='center'
                 paddingTop={window.innerHeight / 2 + 'px'}
                 textColor={theme.text50}
                 text='Author not selected'
                 fontSize='0.8rem'/>
        }

        {selectedAuthor && !selectedBookId &&
          <AuthorView author={selectedAuthor}/>
        }
        {selectedBook &&
          <BookView book={selectedBook}/>
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
  console.log('new AuthorListView')
  const authorList = observeAuthorList()
  const blogMenu = observeBlogMenu()
  const theme = themeManager.theme
  const selectedAuthor = props.selectedAuthor
  const selectedBook = props.selectedBook

  if (!blogMenu.isShown) return <></>

  return <VStack width='100%' height='100vh' gap='5px'
                 paddingTop='100px'
                 paddingLeft='20px'
                 layer={LayoutLayer.MODAL}>

    {authorList.authors.map(author => {
      const isSelected = selectedAuthor?.uid === author.uid
      return <VStack key={author.uid}
                     gap='5px'
                     width='100%'>
        <MenuLinkBtn width='100%'
                     textColor={isSelected && !selectedBook ? theme.menuSelectedItem : theme.menuItem}
                     fontWeight={isSelected && !selectedBook ? 'bold' : theme.defFontWeight}
                     title={author.shortName}
                     link={'/repo/' + author.uid}
                     hoverState={state => {
                       state.textColor = isSelected && !selectedBook ? theme.menuSelectedItem : theme.menuHoveredItem
                       state.textDecoration = 'none'
                     }}/>

        {isSelected && selectedAuthor &&
          selectedAuthor.books.map(book => {
            const isSelected = selectedBook?.id === book.id
            return <MenuLinkBtn key={selectedAuthor.uid + '-' + book.id}
                                width='100%'
                                paddingLeft='20px'
                                textColor={isSelected ? theme.menuSelectedItem : theme.menuItem}
                                fontWeight={isSelected ? 'bold' : theme.defFontWeight}
                                title={book.year ? book.title + '. ' + book.year : book.title}
                                link={'/repo/' + author.uid + '/' + book.id}
                                hoverState={state => {
                                  state.textColor = isSelected ? theme.menuSelectedItem : theme.menuHoveredItem
                                  state.textDecoration = 'none'
                                }}/>
          })}
      </VStack>
    })}
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
    <VStack width="100%" height='100%'
            valign='top' halign='center'
            gap='40px'
            bgColor={theme.text + '08'}
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
                 textColor={theme.header}
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

interface BookViewProps {
  book: Book
}

const BookView = observer(stylable((props: BookViewProps) => {
  console.log('new BookView')
  const theme = themeManager.theme

  return (
    <VStack textColor={theme.text}
            className='article'
            valign="top"
            gap="0"
            width="100%" maxWidth={theme.maxBlogTextWidth}>
      <BookTitle book={props.book}/>
      {props.book.cover &&
        <BookCover book={props.book}/>
      }

      <Spacer height='50px'/>

      <MarkdownText width='100%'
                    text={props.book.markdown}/>
    </VStack>
  )
}))

const BookTitle = observer((props: BookViewProps) => {
  const theme = themeManager.theme
  return (<VStack width='100%' minHeight={props.book.cover ? '100vh' : '0'}
                  valign='center' halign='left'
                  gap='30px'
                  paddingVertical='50px'>

      {/*<Rectangle width='100%' height='100%'*/}
      {/*           layer={LayoutLayer.MINUS}*/}
      {/*           bgColor={theme.green + '50'}*/}
      {/*           left='0' top='0' position='absolute'/>*/}

      {props.book.genre === 'movie' &&
        <Label textColor={theme.header} paddingBottom='30px'
               width='100%' textAlign='center'>
          <span className="icon icon-film"/>
        </Label>
      }

      <Label width='100%'
             textAlign='left'
             className='article'
             textColor={theme.header}
             fontWeight='bold'
             textTransform='uppercase'
             letterSpacing='2px'
             fontSize='2.5rem'
             text={props.book.title}/>

      <BookAnnotation authorName={props.book.author.shortName}
                      bookYear={props.book.year}
                      textColor={theme.text50}/>

      <Label textAlign='left'
             className='article'
             textColor={theme.header}
             fontSize='1.1rem'
             text={props.book.about}/>

    </VStack>
  )
})

const BookCover = (props: BookViewProps) => {
  return <VStack width='100vw' height='100vh'>
    <StylableContainer width='100vw' height='100vh'
                       layer={LayoutLayer.MINUS}
                       bgImageSrc={props.book.cover}
                       bgImageAttachment='scroll'
                       bgImageRepeat='no-repeat'
                       bgImageSize='cover' opacity='0.6'
                       left='0' position='absolute'/>
  </VStack>
}

interface BookAnnotationProps extends LabelProps {
  authorName: string
  bookYear: string
}

const BookAnnotation = (props: BookAnnotationProps) => {
  return <Label className='article'
                fontSize='0.9rem'
                whiteSpace='nowrap'
                text={props.bookYear ? props.authorName + ', ' + props.bookYear : props.authorName}
                {...props}/>
}
