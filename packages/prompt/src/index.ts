import enquirer from 'enquirer'
import SuggestPrompt from './suggest-prompt'

type PromptMessage = string | (() => string) | (() => Promise<string>)

type PromptValidate = (
  value: string
) => boolean | Promise<boolean> | string | Promise<string>

type PromptResult = (value: string) => string | Promise<string>

interface PromptInputOptions {
  initial?: string
  hint?: string
  validate?: PromptValidate
  result?: PromptResult
}

const input = async (message: PromptMessage, options?: PromptInputOptions) => {
  const { answer } = await await enquirer.prompt({
    type: 'input',
    name: 'answer',
    message,
    ...{ result: p => p.trim() },
    ...options
  })
  return answer as string
}

const invisible = async (
  message: PromptMessage,
  options?: PromptInputOptions
) => {
  const { answer } = await enquirer.prompt({
    type: 'invisible',
    name: 'answer',
    message,
    ...{ result: p => p.trim() },
    ...options
  })
  return answer as string
}

const password = async (
  message: PromptMessage,
  options?: PromptInputOptions
) => {
  const { answer } = await enquirer.prompt({
    type: 'invisible',
    name: 'password',
    message,
    ...{ result: p => p.trim() },
    ...options
  })
  return answer as string
}

const text = async (message: PromptMessage, options?: PromptInputOptions) => {
  const { answer } = await enquirer.prompt({
    type: 'invisible',
    name: 'password',
    message,
    ...{ multiline: true },
    ...{ result: p => p.trim() },
    ...options
  })
  return answer as string
}

interface PromptConfirmOptions {
  initial?: boolean
}

const confirm = async (
  message: PromptMessage,
  options?: PromptConfirmOptions
) => {
  const { answer } = await enquirer.prompt({
    type: 'confirm',
    name: 'answer',
    message,
    ...options
  })
  return typeof answer === 'boolean' ? answer : false
}

interface PromptNumeralOptions {
  min?: number
  max?: number
  delay?: number
  float?: boolean
  round?: boolean
  major?: number
  minor?: number
  initial?: number
}

const numeral = async (
  message: PromptMessage,
  options?: PromptNumeralOptions
) => {
  const { answer } = await enquirer.prompt({
    type: 'numeral',
    name: 'answer',
    message,
    ...options
  })
  return answer as number
}

interface PromptChoice {
  name: string
  message?: string
  value?: string
  hint?: string
  disabled?: boolean | string
}

interface PromptSelectOptions {
  initial?: number
  limit?: number
  result?: PromptResult
}

const select = async <T extends string | PromptChoice>(
  message: PromptMessage,
  choices: T extends string ? string[] : PromptChoice[],
  options?: PromptSelectOptions
): Promise<T extends string ? string : PromptChoice> => {
  const { answer } = await enquirer.prompt({
    type: 'select',
    name: 'answer',
    message,
    choices,
    ...options
  })
  return answer
}

const multiselect = async <T extends string | PromptChoice>(
  message: PromptMessage,
  choices: T extends string ? string[] : PromptChoice[],
  options?: PromptSelectOptions
): Promise<T extends string ? string[] : PromptChoice[]> => {
  const { answer } = await enquirer.prompt({
    type: 'multiselect',
    name: 'answer',
    message,
    choices,
    ...options
  })
  return answer
}

const autocomplete = async <T extends string | PromptChoice>(
  message: PromptMessage,
  choices: T extends string ? string[] : PromptChoice[],
  options?: PromptSelectOptions
): Promise<T extends string ? string : PromptChoice> => {
  const { answer } = await enquirer.prompt({
    type: 'autocomplete',
    name: 'answer',
    message,
    choices,
    ...options
  })
  return answer
}

interface PromptSuggestOptions {
  initial?: number
}

const suggest = async <T extends string | PromptChoice>(
  message: PromptMessage,
  choices: string[],
  options?: PromptSuggestOptions
): Promise<string> => {
  return new SuggestPrompt({
    name: 'answer',
    message,
    choices,
    ...options
  }).run()
}

export = Object.assign(enquirer.prompt, {
  input,
  numeral,
  confirm,
  invisible,
  password,
  text,
  select,
  multiselect,
  autocomplete,
  suggest
})
