import React, { useState } from 'react'
import Button from '../../../../app/components/button'
import { Color } from '../../../../app/common/types/color'

export const render = () => {
  const [buttonText, setButtonText] = useState('Submit')
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="text-inputs">
      <h2>Button</h2>
      Just a button (nothing)
      <div className="sandbox">
        <Button text="" onClick={() => undefined} />
      </div>
      Text
      <div className="sandbox">
        <Button text="Submit" onClick={() => undefined} />
      </div>
      Text + onClick interactivity
      <div className="sandbox">
        <Button text={buttonText} onClick={() => setButtonText(`(last clicked at ${Date.now()}`)} />
        <button type="button" onClick={() => setButtonText('Submit')}>Reset Text</button>
      </div>
      Text + Colors
      <div className="sandbox">
        <Button text="Submit" color={Color.BLUE} onClick={() => undefined} />
        <Button text="Delete" color={Color.RED} onClick={() => undefined} />
        <Button text="Add Purchase" color={Color.GREEN} onClick={() => undefined} />
      </div>
      Text + Icon
      <div className="sandbox">
        <Button text="Cancel" icon="times" onClick={() => undefined} />
        <Button text="Cancel" icon="times" iconColor={Color.RED} onClick={() => undefined} />
        <Button text="Approve" icon="check" iconColor={Color.GREEN} onClick={() => undefined} />
        <Button text="" icon="check" iconColor={Color.GREEN} onClick={() => undefined} />
      </div>
      Loading
      <div className="sandbox">
        <Button text="Submit" icon="check" iconColor={Color.GREEN} isLoading={isLoading} onClick={() => setIsLoading(true)} />
      </div>
    </div>
  )
}

export default render
