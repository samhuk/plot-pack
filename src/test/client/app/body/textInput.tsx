import React from 'react'
import TextInput from '../../../../app/components/textInput'

export const render = () => (
  <div className="text-inputs">
    <h2>Text Input</h2>
    Just an input box
    <div className="sandbox">
      <TextInput onChange={(): void => undefined} />
    </div>
    label
    <div className="sandbox">
      <TextInput label="Username" onChange={(): void => undefined} />
    </div>
    icon
    <div className="sandbox">
      <TextInput icon="user" onChange={(): void => undefined} />
    </div>
    label + icon
    <div className="sandbox">
      <TextInput icon="user" label="Username" onChange={(): void => undefined} />
    </div>
    label + icon + placeholder
    <div className="sandbox">
      <TextInput icon="user" label="Username" placeholder="At least 8 characters" onChange={(): void => undefined} />
    </div>

    interactivity test
    <div className="sandbox">
      <TextInput icon="user" label="Username" placeholder="At least 8 characters" onChange={(): void => undefined} />
    </div>
  </div>
)

export default render
