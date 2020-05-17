import React from 'react'

// components
import Header from './header/index'
import Body from './body/index'

// styles
/* eslint-disable import/no-unresolved */
import 'test/client/assets/scss/standard.scss'
/* eslint-enable import/no-unresolved */

export const App = () => (
  <>
    <Header title="React Plot Pack" />
    <Body />
  </>
)

export default App
