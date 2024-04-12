import React from 'react'
import { stylable, VStack } from 'react-nocss'

export const Spinner = stylable(() => {
  return <VStack halign="center" valign="center" height='100vh'>
    <div className="lds-spinner">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </VStack>
})
