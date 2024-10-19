import React, {useEffect, useState} from 'react'
import {LayoutLayer} from '../../global/application/Application'
import {HStack, Image, Label, Spacer, type StackProps, StylableContainer, VStack} from 'react-nocss'
import {NavBar} from '../../global/ui/NavBar'
import {blogContext, useWindowSize} from '../../App'
import {observeEditor, observeUser} from '../BlogContext'
import {type File, type Page} from '../domain/BlogModel'
import {themeManager} from '../../global/application/ThemeManager'
import {MarkdownText} from '../../global/ui/MarkdownText'
import {observe, observer} from '../../lib/rx/RXObserver'
import {BlogMenuView} from './menu/BlogMenuView'
import {TextButton} from '../../global/ui/Button'
import {EditorView} from './editor/EditorView'
import {useNavigate} from 'react-router'

export const BlogPage = observer(() => {
  const user = observeUser()
  observe(user.selectedFile)
  const isFileEditing = user.selectedFile?.isEditing ?? false

  console.log('new BlogPage, selectedFile:', user.selectedFile)
  const theme = themeManager.theme
  const restApi = blogContext.restApi
  useWindowSize()

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
          window.scrollTo(0, elementPos - 40)
        }
      }, 0)
      return () => {
        clearTimeout(timerId)
      }
    }
  }, [user.selectedFile, user.selectedChapter])

  if (!restApi.isServerRunning) {
    return <ServerNotLaunchedNotification/>
  }

  return <VStack
    width='100%'
    minHeight='100vh'
    halign='left'
    valign='top'>

    <NavBar/>

    <HStack
      halign='left'
      valign='top'
      gap='0'
      width='100%' height='100%'>
      {!isFileEditing &&
        <VStack
          position='fixed'
          className='rtl listScrollbar'
          width={theme.menuWidthPx + 'px'}
          enableOwnScroller
          left='0' top='40px' bottom='0'
          layer={LayoutLayer.ONE}>
          <BlogMenuView/>
        </VStack>

      }

      {isFileEditing && <>
        <Spacer width='50%'/>
        <EditorView width='50%' height='100vh'/>
      </>
      }

      <VStack
        halign='left'
        valign='top'
        layer={LayoutLayer.ZERO}
        position='absolute'
        top='0'
        left={isFileEditing ? '50%' : theme.menuWidthPx + 'px'}
        right='0'
        height='100%'
        gap='80px'>

        {!user.selectedFile &&
          <Label
            width='100%'
            textAlign='center'
            paddingTop={window.innerHeight / 2 + 'px'}
            textColor={theme.text50}
            text='File not selected'
            fontSize='0.8rem'/>
        }

        {user.selectedFile && !user.selectedFile.isLoading &&
          <FileView file={user.selectedFile}/>
        }
      </VStack>
    </HStack>
  </VStack>
})

const ServerNotLaunchedNotification = () => {
  const theme = themeManager.theme
  const title = `The server is not running.
To start the server, execute commands in the terminal:`
  return <VStack
    halign="center"
    valign="center"
    gap='20px'
    height="100vh">
    <NavBar/>

    <Label
      text={title}
      textAlign='center'
      whiteSpace="pre"
      textColor={theme.text}
      fontSize='1.1rem'/>

    <VStack
      gap='0'
      valign='center'
      halign='center'
      width='500px'
      paddingVertical='10px'
      paddingHorizontal='20px'
      bgColor={theme.text + '10'}
      borderColor={theme.text + '20'}
      cornerRadius='8px'>
      <Label
        text='$ cd ../Blog'
        className='mono'
        width='100%'
        textColor={theme.header}
        fontSize='0.9rem'/>

      <Label
        text='$ python3 run_server.py'
        className='mono'
        width='100%'
        textColor={theme.header}
        fontSize='0.9rem'/>
    </VStack>
  </VStack>
}
//
// const CreateBookForm = observer(({author}: { author: Directory }) => {
//   const theme = themeManager.theme
//   const [isFormOpened, setIsFormOpened] = React.useState(false)
//   const [getErr, setErr] = React.useState('')
//   const navigate = useNavigate()
//
//   const openForm = () => {
//     setIsFormOpened(true)
//   }
//
//   const createBook = (id: string) => {
//     if (!id) return
//
//     const bookId = id.toLowerCase()
//     const duplicate = author.children.find(b => b.id === bookId)
//     if (duplicate) {
//       setErr('Duplicate was found')
//     } else {
//       const b = author.createFile(bookId)
//       if (b) {
//         navigate('/repo/' + author.id + '/' + b.id)
//         setIsFormOpened(false)
//         setErr('')
//       } else {
//         setErr('Storing has failed')
//       }
//     }
//   }
//
//   return (
//     <VStack
//       width='300px'
//       valign="top"
//       halign="right"
//       gap="4px"
//       position='absolute'
//       top='40px'
//       right='10px'>
//
//       <Button
//         title='New Book'
//         fontSize='0.9rem'
//         paddingBottom='1px'
//         paddingHorizontal='10px'
//         minHeight='25px'
//         bgColor={undefined}
//         textColor={theme.red}
//         hoverState={(state: ButtonProps) => {
//           state.btnCursor = true
//           state.textColor = theme.isLight ? theme.red + 'cc' : theme.white
//         }}
//         onClick={openForm}/>
//
//       {isFormOpened &&
//         <TextInputForm
//           text=''
//           title='Book ID:'
//           autoFocus
//           onApply={t => {
//             createBook(t)
//           }}
//           onCancel={() => {
//             setIsFormOpened(false)
//           }}/>
//       }
//
//       {getErr &&
//         <Label
//           fontSize='0.8rem'
//           width='100%'
//           textAlign='center'
//           textColor={theme.orange}
//           opacity='0.8'
//           text={getErr}/>
//       }
//
//     </VStack>
//   )
// })

const FileView = observer(({file}: {file: File}) => {
  console.log('new FileView')
  observe(file)
  const theme = themeManager.theme
  const user = blogContext.user

  return (
    <VStack
      textColor={theme.text}
      className='article'
      gap="0"
      paddingBottom='20px'
      width="100%">
      {!file.isEditing &&
        <FileBtnBar file={file}/>
      }
      <FileInfo file={file}/>

      {!file.isDirectory &&
        <Spacer height='50px'/>
      }

      {file.pages.map((page, index) => {
        return <PageView key={page.uid} page={page} index={index}/>
      })}

      {file.isEditing &&
        <HStack
          width='50%' height='100px'
          halign='right' valign='bottom'
          paddingHorizontal='20px'>
          <TextButton
            title='Delete'
            onClick={() => {
              user.remove(file)
            }}/>
        </HStack>
      }
    </VStack>
  )
})

const FileBtnBar = ({file}: {file: File}) => {
  const navigate = useNavigate()
  const createFile = () => {
    const res = file.createAndAddFile()
    if (res) navigate(res.link)
  }

  const createDir = () => {
    const res = file.createAndAddDirectory()
    if (res) navigate(res.link)
  }

  return (
    <VStack width='200px' halign='right' gap='0px' position='fixed' top='40px' right='20px'>
      <TextButton
        title='Edit'
        onClick={() => {
          file.isEditing = true
        }}/>

      {file.isDirectory &&
        <TextButton
          title='Add Directory'
          onClick={createDir}/>
      }

      {file.isDirectory &&
        <TextButton
          title='Add File'
          onClick={createFile}/>
      }
    </VStack>
  )
}

const PageView = observer(({page, index}: { page: Page, index: number }) => {
  console.log('new PageView')
  const editor = blogContext.editor
  observe(page)
  const isFileEditing = page.file?.isEditing ?? false
  const theme = themeManager.theme

  const toggleSelection = (e: any) => {
    e.stopPropagation()
    editor.selectedPage = editor.selectedPage === page ? undefined : page
  }

  return (
    <StylableContainer
      id={'#' + index}
      className={isFileEditing ? theme.id + ' notSelectable' : theme.id}
      onMouseDown={isFileEditing ? toggleSelection : undefined}
      maxWidth={theme.maxBlogTextWidth}
      width="100%"
      minHeight="30px"
      paddingLeft={isFileEditing && page.isSelected ? '74px' : '80px'}
      borderLeft={isFileEditing && page.isSelected ? ['6px', 'solid', theme.red] : undefined}
      bgColor={isFileEditing && page.isSelected ? theme.red + '10' : undefined}
      hoverState={state => {
        state.bgColor = isFileEditing ? theme.selectedBlockBg : undefined
      }}>
      <MarkdownText width='100%' text={page.text}/>
    </StylableContainer>
  )
})

const FileInfo = observer(({file}: {file: File}) => {
  const theme = themeManager.theme
  const info = observe(file.info)
  const editor = observeEditor()

  const isSelected = editor.selectedPage === info

  const toggleSelection = (e: any) => {
    if (file.isEditing) {
      e.stopPropagation()
      editor.selectedPage = isSelected ? undefined : info
    }
  }

  return <StylableContainer
    className={file.isEditing ? 'notSelectable' : ''}
    paddingLeft={file.isEditing && isSelected ? '0' : '6px'}
    width="100%"
    maxWidth={theme.maxBlogTextWidth}
    paddingTop='40px'
    onMouseDown={toggleSelection}
    bgColor={file.isEditing && isSelected ? theme.red + '10' : undefined}
    borderLeft={file.isEditing && isSelected ? ['6px', 'solid', theme.red] : undefined}
    hoverState={state => {
      if (file.isEditing) {
        state.bgColor = isSelected ? theme.red + '10' : theme.selectedBlockBg
        state.paddingLeft = isSelected ? '0' : '6px'
      } else {
        state.bgColor = undefined
        state.paddingLeft = '6px'
      }
    }}>

    {file.info.author &&
      <AuthorInfoView file={file}/>
    }

    {!file.info.author &&
      <ArticleInfoView file={file}/>
    }

  </StylableContainer>
})

const AuthorInfoView = ({file}: {file: File}) => {
  const theme = themeManager.theme
  const info = file.info
  const author = file.info.author
  const nameParts = author?.fullName.split(' ') ?? []
  const surname = nameParts.length > 0 ? nameParts[0] : ''
  const name = author?.fullName.substring(surname.length) ?? ''
  const years = '(' + (author?.birthYear ?? '') + (author?.deathYear ? '-' + author?.deathYear : '') + ')'

  return <VStack
    width='100%'
    minHeight={info.cover ? '100vh' : '0'}
    valign='top' halign='center'
    bgColor={theme.isLight ? '#ffFFff50' : '#ffFFff05'}
    gap='10px' padding="40px"
    paddingVertical='50px'>
    <HStack width='100%' halign='center'>
      <Label
        textAlign='left'
        className='def'
        textColor={theme.header}
        fontWeight='bold'
        letterSpacing='2px'
        fontSize='2.5rem'
        text={surname}/>
      <Label
        textAlign='left'
        className='def'
        textColor={theme.header}
        fontWeight='100'
        letterSpacing='2px'
        fontSize='2.5rem'
        text={name}/>
    </HStack>

    <Label
      width='100%'
      textAlign='center'
      className='def'
      textColor={theme.text}
      fontWeight='100'
      letterSpacing='2px'
      fontSize='1.1rem'
      text={years}/>

    {file.info.photo &&
      <Photo
        overflow='hidden'
        maxWidth='600px'
        paddingVertical='50px'
        alt='Autho photo'
        src={blogContext.restApi.assetsUrl + file.info.photo}/>
    }

    <Label
      textAlign='left'
      className='article'
      textColor={theme.text}
      paddingVertical='20px'
      fontSize='1.1rem'
      text={info.about}/>
  </VStack>
}

interface ImageProps extends StackProps {
  src: string
  alt: string
  containerWidth?: string
  containerHeight?: string
  preview?: string
}

export const Photo = (props: ImageProps) => {
  const {containerWidth, containerHeight, width, height, preview, alt, src, ...style} = props

  const [showPreview, setShowPreview] = useState(props.preview !== undefined)

  useEffect(() => {
    if (props.preview) {
      setShowPreview(true)
      setTimeout(() => {
        setShowPreview(false)
      }, 100)
    }
  }, [props.src])

  if ('visible' in props && !props.visible) return <></>

  return (
    <VStack {...style}
      width={containerWidth ?? width}
      height={containerHeight ?? height}>
      <img
        style={{'maxWidth': style.maxWidth}}
        width={width}
        height={height}
        src={showPreview ? preview : src} alt={alt}/>
    </VStack>
  )
}

const ArticleInfoView = ({file}: {file: File}) => {
  const theme = themeManager.theme
  const parent = file.parent
  const info = file.info

  return <VStack
    width='100%'
    minHeight={info.cover ? '100vh' : '0'}
    valign='top' halign='left'
    gap='20px'
    paddingVertical='50px'>
    <VStack
      width='100%'
      minHeight={file.info.cover ? '100vh' : '0'}
      valign='top' halign='left'
      gap='20px' paddingHorizontal="80px"
      paddingVertical='50px'>
      {info.genre === 'movie' &&
        <Label
          textColor={theme.header}
          padding='30px'
          width='100%' textAlign='center'>
          <span className="icon icon-film"/>
        </Label>
      }

      {file.info.author &&
        <Label
          width='100%'
          textAlign='left'
          className='article'
          textColor={theme.header}
          fontWeight='bold'
          textTransform='uppercase'
          letterSpacing='2px'
          fontSize='2.5rem'
          text={info.name}/>
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
        text={info.name}/>

      {parent?.info.author &&
        <Label
          className='article'
          textColor={theme.text50}
          fontSize='1.2rem'
          whiteSpace='nowrap'
          paddingBottom='20px'
          text={info.year ? parent.info.author.shortName + ', ' + info.year : parent.info.author.shortName}/>
      }

      <Label
        textAlign='left'
        className='article'
        textColor={theme.header}
        fontSize='1.2rem'
        text={info.about}/>
    </VStack>
    {file.info.cover &&
      <Image
        containerWidth='100vw'
        overflow='hidden'
        width='100%'
        layer={LayoutLayer.MINUS}
        alt='Cover Image'
        src={blogContext.restApi.assetsUrl + file.info.cover}
        opacity='0.6'
        position='relative'
        left={-theme.menuWidthPx - 5 + 'px'}/>
    }
  </VStack>
}
