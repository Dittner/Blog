import {observe, observer} from '../../../lib/rx/RXObserver'
import {HStack, Label, LinkButton, type LinkButtonProps, Spacer, VStack} from 'react-nocss'
import {observeBlogMenu, observeUser} from '../../BlogContext'
import {themeManager} from '../../../global/application/ThemeManager'
import type {JSX} from 'react/jsx-runtime'
import {LayoutLayer} from '../../../global/application/Application'
import {type File} from '../../domain/BlogModel'
import {type IconType, TextButton} from '../../../global/ui/Button'
import {useNavigate} from 'react-router'

export const BlogMenuView = observer(() => {
  const user = observeUser()
  observe(user.repo)
  const blogMenu = observeBlogMenu()
  const selectedFile = user.selectedFile
  const navigate = useNavigate()

  if (!blogMenu.isShown) return <></>

  const ids = selectedFile ? selectedFile.link.split('/') : []

  console.log('new BlogMenuView, ids:', ids)

  const links = menuLinkList(user.repo, ids, 0, selectedFile)

  const createDir = () => {
    const res = user.repo.createAndAddDirectory()
    if (res) navigate(res.link)
  }

  return <VStack
    width='100%'
    gap='8px'
    className='ltr'
    fontSize='0.9rem'
    paddingLeft='32px'
    paddingRight='20px'
    paddingBottom='20px'
    layer={LayoutLayer.MODAL}>

    {links}

    <Spacer height='25px'/>
    <TextButton
      title='Add Directory'
      onClick={createDir}/>
  </VStack>
})

const menuLinkList = (from: File, openedDirectoriesIds: string[], openedDirectoryDepth: number, selectedFile?: File): JSX.Element[] => {
  const theme = themeManager.theme
  const links: JSX.Element[] = []

  from.children.forEach(f => {
    const isFileSelected = selectedFile?.uid === f.uid
    const isDirectoryOpened = f.isDirectory && openedDirectoriesIds[openedDirectoryDepth + 1] === f.id
    const fileComponent = <MenuLinkBtn
      key={'menu-' + f.uid}
      width='100%'
      icon={f.isDirectory && !f.info.author ? 'folder' : undefined}
      paddingLeft={20 * openedDirectoryDepth + 'px'}
      textColor={isFileSelected ? theme.menuSelectedItem : theme.menuItem}
      fontWeight={isFileSelected ? 'bold' : theme.defFontWeight}
      title={f.info.author?.shortName ?? (f.info.year ? f.info.name + '. ' + f.info.year : f.info.name)}
      link={f.link}
      hoverState={state => {
        state.textColor = isFileSelected ? theme.menuSelectedItem : theme.menuHoveredItem
        state.textDecoration = 'none'
      }}/>

    links.push(fileComponent)

    if (isDirectoryOpened) {
      links.push(...menuLinkList(f, openedDirectoriesIds, openedDirectoryDepth + 1, selectedFile))
    }
    else if (isFileSelected) {
      links.push(<FileContentHeadersView
        key='fileSubTitle'
        file={f}
        paddingLeftPx={20 * (openedDirectoryDepth + 1)}/>)
    }
  })
  return links
}

interface MenuLinkBtnProps extends LinkButtonProps {
  icon?: IconType
}
const MenuLinkBtn = (props: MenuLinkBtnProps) => {
  const {paddingLeft, hoverState, textColor, fontWeight, title, link, ...style} = props

  if (props.icon) {
    return <HStack
      valign='top'
      gap='5px'
      hoverState={hoverState}
      textColor={textColor}
      paddingLeft={paddingLeft}
      {...style}>
      <Label
        className={'icon-' + props.icon}
        textColor='inherit'
      />
      <LinkButton
        link={link}
        paddingTop='2px'
        title={title}
        fontWeight={fontWeight}
        lineHeight='1.1'
        textColor='inherit'
        textDecoration='none'
        {...style}/>
    </HStack>
  }
  return <LinkButton
    link={link}
    title={title}
    paddingLeft={paddingLeft}
    fontWeight={fontWeight}
    textColor={textColor}
    lineHeight='1.1'
    hoverState={hoverState}
    {...style}/>
}

const SUBTITLE_SEARCH_REG = /\$#+ *(.+)/i
const FileContentHeadersView = ({file, paddingLeftPx}: {file: File, paddingLeftPx: number}) => {
  const theme = themeManager.theme
  return <>
    {file.pages.map((p, index) => {
      if (!p.text.startsWith('$#')) return null
      let headerLevel = -2
      let i = 1
      while (p.text.length > i && p.text.at(i) === '#') {
        headerLevel++
        i++
      }

      const res = p.text.match(SUBTITLE_SEARCH_REG)
      const h = res && res.length > 0 ? res[1] : ''

      return <MenuLinkBtn
        key={p.uid}
        width='100%'
        paddingLeft={(paddingLeftPx + headerLevel * 20) + 'px'}
        textColor={theme.blue}
        fontWeight={theme.defFontWeight}
        title={h}
        link={file.link + '#' + index}
        hoverState={state => {
          state.textColor = theme.menuHoveredItem
          state.textDecoration = 'none'
        }}/>
    })}
  </>
}
