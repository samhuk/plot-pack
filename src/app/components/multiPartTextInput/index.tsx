import React, { useState } from 'react'
import Options from './types/Options'
import TextInputPart from './types/TextInputPart'

import InputIcon from '../inputIcon'

const CONTAINER_CLASS = 'ui-multipart-text-input-container'
const INPUT_LIST_CONTAINER = 'ui-input-list-container'
const INPUT_ICON_CONTAINER_CLASS = 'ui-input-icon-container'
const INPUT_CLASS = 'ui-text-input'
const INPUT_SEPARATOR_CLASS = 'ui-text-input-separator'
const LABEL_CLASS = 'ui-text-input-label'
const HAS_ICON_CLASS = 'has-icon'

/**
 * Enables the automatic focusing of the next input element when necessary.
 */
const autoFocusNextInput = (partList: TextInputPart[], inputElementList: HTMLInputElement[], e: React.FormEvent) => {
  const inputElement = e.target as HTMLInputElement
  const currentIndex = inputElementList.indexOf(inputElement)
  if (currentIndex === -1)
    return
  // Proceed to next input if number of chars entered in current input is at limit
  const shouldFocusNext = currentIndex < inputElementList.length - 1
    && partList[currentIndex]?.length != null
    && inputElement.value.length === partList[currentIndex]?.length
  if (shouldFocusNext) {
    inputElementList[currentIndex + 1].focus()
    return
  }
  // Proceed to previous input if number of chars entered is zero
  const shouldFocusPrevious = currentIndex > 0 && inputElement.value.length === 0
  if (shouldFocusPrevious)
    inputElementList[currentIndex - 1].focus()
}

/**
 * Creates the array of values required for calling the onChange function
 */
const createOnChangeResponse = (inputElements: HTMLInputElement[]) => (
  inputElements.map(element => element.value)
)

export const MultipartTextInput = (props: Options) => {
  const [inputs, setInputs] = useState<HTMLInputElement[]>(new Array(props.partList.length))

  const setInput = (index: number, el: HTMLInputElement) => {
    inputs[index] = el
    setInputs(inputs)
  }

  const onInput = (index: number, e: React.FormEvent) => {
    autoFocusNextInput(props.partList, inputs, e)
    if (props.onChange != null)
      props.onChange(createOnChangeResponse(inputs))
  }

  return (
    <div
      className={`${CONTAINER_CLASS} ${props.icon != null ? HAS_ICON_CLASS : ''}`}
      id={props.id}
    >
      {props.label != null ? <div className={LABEL_CLASS}>{props.label}</div> : null}
      <div className={INPUT_ICON_CONTAINER_CLASS}>
        {props.icon != null ? <InputIcon icon={props.icon} /> : null}
        <div className={INPUT_LIST_CONTAINER}>
          {props.partList.map((part, i) => (
            <>
              {part.separatorPrefix != null ? <div className={INPUT_SEPARATOR_CLASS}>{part.separatorPrefix}</div> : null}
              <input
                className={INPUT_CLASS}
                type="text"
                maxLength={part.length}
                placeholder={part.placeholder}
                ref={el => setInput(i, el)}
                onInput={e => onInput(i, e)}
              />
            </>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MultipartTextInput
