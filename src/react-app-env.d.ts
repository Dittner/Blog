declare module '*.txt' {
  const content: string
  export default content
}

declare module '*.svg' {
  import type * as React from 'react'

  export const ReactComponent: React.FunctionComponent<React.SVGProps<
  SVGSVGElement
  > & { title?: string }>

  const src: string
  export default src
}
