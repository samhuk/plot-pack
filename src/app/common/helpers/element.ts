export const IS_LOADING_CLASS = 'is-loading'

export const LOADING_ELEMENT_CLASS = 'ui-small-loading-icon'

export const addClasses = (element: HTMLElement, ...classList: string[]) => classList.forEach(c => {
  if (c != null)
    element.classList.add(c)
})

export const toggleClass = (element: HTMLElement, className: string, force?: boolean) => {
  if (force == null ? !element.classList.contains(className) : force)
    element.classList.add(className)
  else
    element.classList.remove(className)
}

export const wrap = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  id: string,
  ...elements: HTMLElement[]
): HTMLElementTagNameMap[K] => {
  const el = document.createElement(tag)
  if (className != null) el.classList.add(className)
  if (id != null) el.id = id
  for (let i = 0; i < elements.length; i += 1) if (elements[i] != null) el.appendChild(elements[i])
  return el
}

export const wrapWithElement = <T extends HTMLElement>(el: T, ...elements: HTMLElement[]) => {
  for (let i = 0; i < elements.length; i += 1) if (elements[i] != null) el.appendChild(elements[i])
  return el
}

export const createElement = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, id?: string) => {
  const el = document.createElement(tag)
  if (className != null) el.classList.add(className)
  if (id != null) el.id = id
  return el
}

export const iconClass = (iconName: string): string => `icon icon-${iconName}`;

export const createIcon = (iconName: string, className?: string, id?: string): HTMLElement => {
  const el = document.createElement('i')
  if (className != null) el.classList.add(className)
  if (id != null) el.id = id
  addClasses(el, ...iconClass(iconName).split(' '))
  return el
}

export const createInputElement = (type: string, className?: string, id?: string): HTMLInputElement => {
  const el = document.createElement('input')
  el.type = type
  if (className != null) el.classList.add(className)
  if (id != null) el.id = id
  return el
}

export const createTextElement = <K extends keyof HTMLElementTagNameMap>(text: any, tag?: K, className?: string, id?: string) => {
  const el = document.createElement(tag ?? 'div')
  if (className != null) el.classList.add(className)
  if (id != null) el.id = id
  if (text != null) el.textContent = text.toString()
  return el
}

export const createButton = (text: string, onClick: (e: MouseEvent) => void, className?: string, id?: string, icon?: string) => {
  const iconElement = icon != null ? createIcon(icon) : null
  const el = wrap('button', className, id, createTextElement(text), iconElement)
  el.type = 'button'
  el.addEventListener('click', onClick)
  return el
}

export const toggleLoadingElement = (element: HTMLElement, isLoading: boolean) => {
  if (isLoading && element.getElementsByClassName(LOADING_ELEMENT_CLASS).length === 0) {
    const loadingElement = createIcon('spinner', LOADING_ELEMENT_CLASS)
    addClasses(loadingElement, 'icon-spin', 'icon-lg')
    element.appendChild(loadingElement)
  } else {
    const existingLoadingElements = element.getElementsByClassName(LOADING_ELEMENT_CLASS)
    for (let i = 0; i < existingLoadingElements.length; i += 1)
      existingLoadingElements[i].remove()
  }

  toggleClass(element, IS_LOADING_CLASS, isLoading)
}
