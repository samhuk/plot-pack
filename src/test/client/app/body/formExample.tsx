import React, { useState } from 'react'
import Button from '../../../../app/components/button'
import TextInput from '../../../../app/components/textInput'
import { Color } from '../../../../app/common/types/color'
import { debounce, merge } from '../../../../app/common/helpers/function'
import MultipartTextInput from '../../../../app/components/multiPartTextInput'

const determineIfIsFormValid = (
  username: string,
  password: string,
): Promise<boolean> => new Promise(resolve => {
  setTimeout(() => resolve(username?.length > 0 && password?.length > 0), 500)
})

export const render = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isFormValid, setIsFormValid] = useState(false)
  const [isFormValidLoading, setIsFormValidLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const onSubmitClick = () => {
    setHasSubmitted(true)
  }

  const updateSubmitButton = (_username: string, _password: string) => {
    setIsFormValidLoading(true)
    debounce(() => {
      determineIfIsFormValid(_username, _password).then(isValid => {
        setIsFormValidLoading(false)
        setIsFormValid(isValid)
      })
    }, 500)()
  }

  const onUsernameInput = merge(setUsername, newUsername => updateSubmitButton(newUsername as string, password))

  const onPasswordInput = merge(setPassword, newPassword => updateSubmitButton(username, newPassword as string))

  const onCancelClick = () => {

  }

  return (
    <div className="interop">
      <h2>Form Example</h2>
      <div className="sandbox">
        <TextInput icon="user" label="Username" placeholder="Username or Email" onChange={onUsernameInput} />
        <TextInput icon="key" label="Password" placeholder="At least 8 characters" onChange={onPasswordInput} />
        <MultipartTextInput
          label="Registration Code"
          icon="hashtag"
          partList={[
            { length: 2, placeholder: 'XXXXX' },
            { length: 2, placeholder: 'XXXXX', separatorPrefix: '-' },
            { length: 2, placeholder: 'XXXXX', separatorPrefix: '-' },
          ]}
        />
        <div className="button-list">
          <Button text="Submit" color={Color.BLUE} isEnabled={isFormValid} isLoading={isFormValidLoading} onClick={onSubmitClick} />
          <Button text="Cancel" icon="times" iconColor={Color.RED} onClick={onCancelClick} />
        </div>
        {hasSubmitted ? <b>Form Submitted!</b> : null}
      </div>
    </div>
  )
}

export default render
