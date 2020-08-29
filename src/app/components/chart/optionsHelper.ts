import cloneDeep from 'clone-deep'
import InputOptions from './types/InputOptions'
import Options from './types/Options'

/**
 * Deep copy the provided options
 */
export const cloneOptions = <T extends InputOptions | Options>(options: T): T => cloneDeep(options) as T

export default cloneOptions
