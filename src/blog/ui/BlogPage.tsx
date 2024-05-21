import React, { useEffect } from 'react'
import { LayoutLayer } from '../../global/application/Application'
import { observe, observer } from 'react-observable-mutations'
import { useParams } from 'react-router-dom'
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
import { NavBar } from '../../global/ui/NavBar'
import { useBlogContext, useWindowSize } from '../../App'
import { observeAuthorList, observeBlogMenu, observeEditor } from '../BlogContext'
import { type Author, type Book, type Page } from '../domain/BlogModel'
import { themeManager } from '../../global/application/ThemeManager'
import { MarkdownText } from '../../global/ui/MarkdownText'

export const BlogPage = observer(() => {
  console.log('new BlogPage')
  const theme = themeManager.theme
  const { restApi } = useBlogContext()
  const authorList = observe(useBlogContext().authorList)
  const editor = observeEditor()

  useWindowSize()
  const params = useParams()
  const selectedAuthorId = params.authorId
  const selectedBookId = params.bookId
  const selectedAuthor = authorList.findAuthor(a => a.id === selectedAuthorId)
  const selectedBook = selectedAuthor?.findBook(b => b.id === selectedBookId)
  if (selectedAuthor) observe(selectedAuthor)
  const menuWidth = (window.innerWidth - theme.maxBlogTextWidthPx - 120) >> 1
  if (!selectedBook) editor.editMode = false

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [params.bookId])

  useEffect(() => {
    if (selectedAuthor) {
      restApi.loadAllBooks(selectedAuthor)
    }
  }, [selectedAuthor])

  useEffect(() => {
    restApi.loadAllAuthors()
  }, [])

  if (!restApi.isServerRunning) {
    const title = `The server is not running.
To start the server, execute commands in the terminal:`
    const commands = `$ cd ../Blog
$ python3 run_server.py`
    return <VStack halign="center"
                   valign="center"
                   gap='20px'
                   width="100%" height="100vh">
      <NavBar/>

      <Label text={title}
             textAlign='center'
             whiteSpace="pre"
             textColor={theme.text}
             fontSize='1.1rem'/>

      <Label text={commands}
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
        <BlogMenuView selectedAuthor={selectedAuthor}
                      selectedBook={selectedBook}
                      position='fixed'
                      left='0' top='0' bottom='0'
                      width={menuWidth + 'px'}
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
  console.log('new BlogMenuView')
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
      const isSelected = selectedAuthor?.id === author.id
      return <VStack key={author.id}
                     gap='5px'
                     width='100%'>
        <MenuLinkBtn width='100%'
                     textColor={isSelected && !selectedBook ? theme.menuSelectedItem : theme.menuItem}
                     fontWeight={isSelected && !selectedBook ? 'bold' : theme.defFontWeight}
                     title={author.shortName}
                     link={'/repo/' + author.id}
                     hoverState={state => {
                       state.textColor = isSelected && !selectedBook ? theme.menuSelectedItem : theme.menuHoveredItem
                       state.textDecoration = 'none'
                     }}/>

        {isSelected && selectedAuthor &&
          selectedAuthor.books.map(book => {
            const isSelected = selectedBook?.id === book.id
            return <MenuLinkBtn key={selectedAuthor.id + '-' + book.id}
                                width='100%'
                                paddingLeft='20px'
                                textColor={isSelected ? theme.menuSelectedItem : theme.menuItem}
                                fontWeight={isSelected ? 'bold' : theme.defFontWeight}
                                title={book.year ? book.title + '. ' + book.year : book.title}
                                link={'/repo/' + author.id + '/' + book.id}
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
            maxWidth={theme.maxBlogTextWidth}
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

interface BookViewProps extends StackProps {
  book: Book
}

const BookView = observer((props: BookViewProps) => {
  const { book, ...style } = props
  console.log('new BookView')
  observe(book)
  const theme = themeManager.theme

  return (
    <VStack textColor={theme.text}
            className='article'
            valign="top"
            gap="20px" paddingBottom='50px'
            width="100%" maxWidth={theme.maxBlogTextWidth}
            {...style}>
      <BookTitle book={book}/>
      {book.cover &&
        <BookCover book={book}/>
      }

      <Spacer height='50px'/>

      {book.pages.map(page => {
        return <PageView key={page.uid} page={page}/>
      })}

    </VStack>
  )
})

const PageView = observer(({ page }: { page: Page }) => {
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
        <StylableContainer className={theme.id}
                           minHeight="30px"
                           paddingRight="40px"
                           paddingLeft="34px"
                           width="100%"
                           onMouseDown={toggleSelection}
                           borderLeft={['6px', 'solid', theme.red]}>
          <MarkdownText text={page.text}/>
        </StylableContainer>
      </>
    )
  }

  if (editor.editMode) {
    return <StylableContainer className={theme.id}
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
    <StylableContainer className={theme.id}
                       minHeight="30px"
                       paddingHorizontal="40px"
                       width="100%">
      <MarkdownText text={page.text}/>
    </StylableContainer>
  )
})

const BookTitle = observer((props: BookViewProps) => {
  const theme = themeManager.theme
  return (<VStack width='100%' minHeight={props.book.cover ? '100vh' : '0'}
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
        <Label textColor={theme.header} padding='30px'
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
  const { restApi } = useBlogContext()
  const theme = themeManager.theme
  const menuWidth = (window.innerWidth - theme.maxBlogTextWidthPx) >> 1
  return <Image containerWidth='100vw'
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
  return <Label className='article'
                fontSize='0.9rem'
                whiteSpace='nowrap'
                text={props.bookYear ? props.authorName + ', ' + props.bookYear : props.authorName}
                {...props}/>
}

export const EditorView = observer((props: StackProps) => {
  console.log('new EditorView')
  const editor = observeEditor()
  const theme = themeManager.theme

  return <HStack halign="left"
                 valign="top"
                 gap="0"
                 bgColor={theme.appBg}
                 borderRight={['1px', 'solid', theme.text + '20']}
                 borderColor={theme.transparent}
                 layer={LayoutLayer.ONE}
                 position='fixed' left='0' top='0'
                 {...props}>

    {editor.selectedPage &&
      <TextArea protocol={editor.inputTextBuffer}
                onChange={_ => {
                  editor.inputTextChanged()
                }}
                disabled={!editor.selectedPage}
                className='article listScrollbar'
                disableHorizontalScroll
                width='100%' height='100%'
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
