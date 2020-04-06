import React from 'react'
import MultipartTextInput from '../../../../app/components/multiPartTextInput'

export const render = () => (
  <div className="text-inputs">
    <h2>Multi-Part Text Input</h2>
    Just input boxes
    <div className="sandbox">
      <MultipartTextInput partList={[{ length: 2 }, { length: 2 }, { length: 2 }]} />
    </div>
    label
    <div className="sandbox">
      <MultipartTextInput label="Sort Code" partList={[{ length: 2 }, { length: 2 }, { length: 2 }]} />
    </div>
    icon
    <div className="sandbox">
      <MultipartTextInput icon="user" partList={[{ length: 2 }, { length: 2 }, { length: 2 }]} />
    </div>
    label + icon
    <div className="sandbox">
      <MultipartTextInput label="Sort Code" icon="hashtag" partList={[{ length: 2 }, { length: 2 }, { length: 2 }]} />
    </div>
    label + icon + placeholders
    <div className="sandbox">
      <MultipartTextInput
        label="Sort Code"
        icon="hashtag"
        partList={[
          { length: 2, placeholder: '00' },
          { length: 2, placeholder: '04' },
          { length: 2, placeholder: '00' },
        ]}
      />
    </div>
    label + icon + placeholders + separators
    <div className="sandbox">
      <MultipartTextInput
        label="Sort Code"
        icon="hashtag"
        partList={[
          { length: 2, placeholder: '00' },
          { length: 2, placeholder: '04', separatorPrefix: '-' },
          { length: 2, placeholder: '00', separatorPrefix: '--' },
        ]}
      />
    </div>
    label + icon + placeholders + separators + width constricted
    <div className="sandbox small">
      <MultipartTextInput
        label="Sort Code"
        icon="hashtag"
        partList={[
          { length: 2, placeholder: '00' },
          { length: 2, placeholder: '04', separatorPrefix: '-' },
          { length: 2, placeholder: '00', separatorPrefix: '--' },
        ]}
      />
    </div>
  </div>
)

export default render
