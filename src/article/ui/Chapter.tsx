import { observer } from 'react-observable-mutations'
import { themeManager } from '../../global/application/ThemeManager'
import { Label, Stack, VStack } from 'react-nocss'
import { BlogQuote, Screenshot } from '../../global/ui/common/StandardComponents'
import {
  ARTICLE_KEY_IMG,
  ARTICLE_KEY_QUOTE,
  ARTICLE_KEY_TEXT,
  type ChapterBlock,
  type ImageBlock, type QuoteBlock,
  type TextBlock
} from '../domain/ArticleModel'
import { observeApp } from '../../global/GlobalContext'
import { AppSize } from '../../global/application/Application'
import { MarkdownText } from '../../global/ui/common/MarkdownText'

export interface ChapterProps {
  chapter: ChapterBlock
}

export const Chapter = observer((props: ChapterProps) => {
  const app = observeApp()
  const theme = themeManager.theme
  const chapterBlock = props.chapter

  const isCompact = app.size === AppSize.XS || app.size === AppSize.S
  const layout = isCompact ? 'vertical' : 'horizontal'
  const headerPosition = isCompact ? 'static' : 'sticky'
  const headerWidth = isCompact ? '100%' : '43%'
  const contentWidth = isCompact ? '100%' : '55%'

  return <Stack layout={layout}
                halign='left' valign='top' gap='20px'
                width='100%' maxWidth={theme.maxContentWidth}
                paddingBottom='50px'>
    <Label fontSize='2rem'
           className='article'
           fontWeight='bold'
           text={chapterBlock.title}
           width={headerWidth}
           position={headerPosition} top='50px'/>

    <VStack halign='left' valign='top' gap='20px'
            paddingTop='25px'
            width={contentWidth}>
      {chapterBlock.blocks.map(block => {
        if (block.type === ARTICLE_KEY_IMG) {
          const imgBlock = block as ImageBlock
          return <Screenshot key={block.uid}
                             src={imgBlock.url}
                             title={imgBlock.legend}/>
        }

        if (block.type === ARTICLE_KEY_TEXT) {
          const textBlock = block as TextBlock
          return <MarkdownText className='blog'
                               key={block.uid}
                               width='100%'
                               text={textBlock.text}/>
        }

        if (block.type === ARTICLE_KEY_QUOTE) {
          const quoteBlock = block as QuoteBlock
          return <BlogQuote key={block.uid}
                            text={quoteBlock.text}
                            author={quoteBlock.author}/>
        }

        return <Label key={block.uid}
                      text='Unknown block'
                      fontSize='0.0rem'/>
      })}
    </VStack>
  </Stack>
})
