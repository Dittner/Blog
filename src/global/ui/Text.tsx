import * as React from 'react'
import {Label, type LabelProps} from 'react-nocss'

export const MultilineLabel = (props: LabelProps) => {
  console.log('new MultilineLabel')
  if ('visible' in props && !props.visible) return <></>
  const {text, ...style} = props

  const values = props.text?.split('\n').filter(t => t !== '') ?? []
  //console.log('********************** !!!! values:', values)
  return <>
    { values.map((t, index) => {
      return <Label {...style}
        key={t + index}
        text={t}
      />
    }) }
  </>
}
