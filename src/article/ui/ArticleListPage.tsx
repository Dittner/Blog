import React, { useEffect } from 'react'
import { LayoutLayer } from '../../global/application/Application'
import { useNavigate } from 'react-router-dom'
import { NavBar, NavBarLink } from '../../global/ui/common/NavBar'
import { useBlogContext, useWindowSize } from '../../App'
import { observeArticleList } from '../ArticleContext'
import { uniq } from '../../global/utils/Array++'
import { themeManager } from '../../global/application/ThemeManager'
import { Article } from '../domain/ArticleModel'
import { observer } from 'react-observable-mutations'
import { HStack, Image, Label, Spacer, VStack } from 'react-nocss'

export const ArticleListPage = observer(() => {
  console.log('new BlogPage: ')
  const articleList = observeArticleList()
  const { articleLoader } = useBlogContext()
  const theme = themeManager.theme
  useWindowSize()

  const contentOffset = (window.innerWidth - theme.maxContentWidthPx) / 2 - 5
  const sideListWidth = (theme.maxContentWidthPx - theme.maxBookTextWidthPx) / 2
  const HOR_PAD = window.innerWidth <= theme.maxContentWidthPx ? '20px' : '0'
  const SHOW_ARTICLE_LINKS = window.innerWidth >= theme.maxContentWidthPx

  const navBarLinks = Array.of<NavBarLink | string>(
    new NavBarLink('/library', 'Library'),
    '|',
    new NavBarLink('/blog', 'Blog'))

  useEffect(() => {
    articleLoader.loadAllArticles().then()
  }, [])

  return <VStack width='100%' minHeight='100vh'
                 paddingHorizontal={HOR_PAD}
                 halign='center' valign='top'>

    <NavBar links={navBarLinks}/>

    <HStack halign='center' valign='top'
            width='100%' maxWidth={theme.maxContentWidth}>
      {SHOW_ARTICLE_LINKS &&
        <VStack halign='left' valign='top' position='fixed'
                width={sideListWidth + 'px'}
                gap='0' left={contentOffset + 'px'}
                paddingTop='175px'>

          {articleList.articles.map((article, index) => {
            return <Label key={'ArticleTitle' + article.uid}
                          textColor={theme.text50}
                          text={(index < 9 ? '0' : '') + (index + 1) + '. ' + article.title}
                          fontSize='0.8rem'/>
          })}
        </VStack>
      }

      <VStack halign='center' valign='center'
              width='100%' maxWidth={theme.maxBlogTextWidth}
              gap='40px'
              paddingTop='100px'>

        <HStack width='100%'
                valign='base' halign='left'>
          <Label textColor={theme.text}
                 text={articleList.articles.length + (articleList.articles.length < 2 ? ' article' : ' articles')}
                 fontWeight='bold'
                 fontSize='1.5rem'/>

          <Spacer/>

          <Label textColor={theme.blue}
                 bgColor={theme.blue + '10'} cornerRadius='6px'
                 text='Last updated: December 26, 2023'
                 paddingHorizontal='6px'
                 fontSize='0.8rem'/>

        </HStack>

        {articleList.articles.sort(Article.compare).map(article => {
          return <ArticlePreview key={article.uid} article={article}/>
        })}

        <Spacer/>

      </VStack>

      {SHOW_ARTICLE_LINKS &&
        <VStack halign='right' valign='top' position='fixed'
                width={sideListWidth + 'px'} height='100%' gap='0' right={contentOffset + 'px'}
                paddingTop='175px'>

          {uniq(articleList.articles.map(article => article.year)).sort((a, b) => b - a).map(year => {
            return <Label key={year}
                          textColor={theme.text50}
                          text={year.toString()}
                          fontSize='0.8rem'/>
          })}

        </VStack>
      }

    </HStack>
  </VStack>
})

interface ArticlePreviewProps {
  article: Article
}

const ArticlePreview = (props: ArticlePreviewProps) => {
  const article = props.article
  const navigate = useNavigate()
  console.log('new BlogItem')
  const theme = themeManager.theme

  return (
    <VStack className="def"
            halign="right"
            paddingTop='10px'
            paddingBottom='20px'
            paddingHorizontal='20px'
            valign="top"
            gap="20px"
            width="100%" maxWidth={theme.maxBlogTextWidth}
            borderColor={theme.text50}
            shadow={'5px 5px 0 0 ' + theme.text50}
            layer={LayoutLayer.ONE}
            textColor={theme.text}
            animateAll='500ms'
            hoverState={state => {
              state.bgColor = theme.isLight ? theme.black05 : '#00000050'
              state.btnCursor = true
              state.shadow = '0 0 0 0 ' + theme.text50
            }}
            onClick={() => {
              navigate(article.link)
            }}>

      <Label textColor={theme.text50} height='0'>
        <span className="icon icon-link"/>
      </Label>

      <HStack width='100%' halign='center' valign='center'>
        <Image src={article.preview}
               opacity='0.8'
               alt="Blog image"
               width='300px'
               height='150px'/>

        <Label width='100%' textAlign='center'
               textColor={theme.header}
               text={article.title}
               fontWeight='bold'
               fontSize='1.25rem'/>

      </HStack>

      <Label width='100%'
             textColor={theme.text}
             lineHeight='1.4'
             text={article.subTitle}/>

    </VStack>
  )
}
