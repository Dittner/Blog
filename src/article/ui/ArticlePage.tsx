import React, { useEffect } from 'react'
import { HStack, Label, Rectangle, Spacer, VStack } from 'react-nocss'
import { LayoutLayer, AppSize } from '../../global/application/Application'
import { NavBar, NavBarLink } from '../../global/ui/common/NavBar'
import { useBlogContext, useWindowSize } from '../../App'
import { observeApp } from '../../global/GlobalContext'
import { useParams } from 'react-router-dom'
import { observeArticleList } from '../ArticleContext'
import {
  ARTICLE_KEY_CHAPTER,
  ARTICLE_KEY_IMG,
  ARTICLE_KEY_QUOTE,
  type ChapterBlock,
  type QuoteBlock,
  type ImageBlock
} from '../domain/ArticleModel'
import { themeManager } from '../../global/application/ThemeManager'
import { BlogLbl, BlogQuote, Screenshot } from '../../global/ui/common/StandardComponents'
import { Chapter } from './Chapter'
import { observer } from 'react-observable-mutations'

export const ArticlePage = observer(() => {
  console.log('new ArticlePage: ')
  useWindowSize()
  const app = observeApp()
  const theme = themeManager.theme
  const articleList = observeArticleList()
  const { articleLoader } = useBlogContext()

  const params = useParams()
  const articleUID = params.articleUID
  const article = articleList.findArticle(a => a.uid === articleUID)

  useEffect(() => {
    if (articleUID) articleLoader.loadArticle(articleUID).then()
    window.scrollTo(0, 0)
  }, [articleUID])

  if (!article) {
    return <BlogLbl top='50%' width='100%'
                    textAlign='center' position='absolute'
                    textColor={theme.header}
                    text='Loading...'/>
  }

  const navBarLinks = Array.of<NavBarLink | string>(
    new NavBarLink('/library', 'Library'),
    '|',
    new NavBarLink('/blog', 'Blog'),
    '>',
    new NavBarLink('/blog/' + articleUID, article.title))

  const HOR_PAD = window.innerWidth <= theme.maxContentWidthPx ? '20px' : '0'

  return <VStack width='100%' minHeight='100vh'
                 halign='center' valign='top'>

    <NavBar links={navBarLinks}
            useBg/>

    <VStack layer={LayoutLayer.ONE}
            textColor={theme.text}
            width='100%' maxWidth={theme.maxContentWidth}
            halign='right' valign='top'
            paddingTop='80px' paddingHorizontal={HOR_PAD}
            gap="10px">

      <Label textColor={theme.header}
             width='100%' textAlign='center' paddingVertical='20px'>
        <span className="icon icon-film"/>
      </Label>

      <Spacer height='50px'/>

      <Label fontSize='3rem'
             fontWeight='bold'
             textTransform='uppercase'
             text={article.title}
             textColor={theme.header}
             width='100%'/>

      <HStack halign='left' valign='bottom'
              width='100%' paddingVertical='20px'>

        <Label width='50%'
               textColor={theme.text}
               text={article.subTitle}/>

        <Spacer/>

        <Label className="def"
               textColor={theme.header} whiteSpace='nowrap'
               text={article.month + '/' + article.year}
               fontSize='0.9rem'/>
      </HStack>

      <Rectangle bgColor={theme.header} width='50%' height='15px'/>

      <Spacer height='150px'/>

      {article.blocks.map(block => {
        if (block.type === ARTICLE_KEY_IMG) {
          const imgBlock = block as ImageBlock
          return <Screenshot key={block.uid}
                             src={imgBlock.url}
                             title={imgBlock.legend}/>
        }

        if (block.type === ARTICLE_KEY_CHAPTER) {
          const chapterBlock = block as ChapterBlock
          return <Chapter key={block.uid}
                          chapter={chapterBlock}/>
        }

        if (block.type === ARTICLE_KEY_QUOTE) {
          const quoteBlock = block as QuoteBlock
          return <BlogQuote key={block.uid}
                            width={app.size === AppSize.XS || app.size === AppSize.S ? '100%' : '55.5%'}
                            text={quoteBlock.text}
                            author={quoteBlock.author}/>
        }

        return <Label key={block.uid}
                      textColor={theme.text50}
                      text='Unknown block'
                      fontSize='0.8rem'/>
      })}

      <Spacer/>

    </VStack>
  </VStack>
})
