import { StringPrompt } from 'enquirer'
import Enquirer = require('enquirer')

// tslint:disable

export default class SuggestPrompt extends StringPrompt {
  suggestionIndex: number
  suggestions: any

  constructor(options: any) {
    super(options)
    const { initial, choices } = options
    this.suggestionIndex = typeof initial === 'number' ? initial : 0
    this.suggestions = choices
    this.suggest()
  }

  suggest() {
    this.initial = this.suggestions && this.suggestions[this.suggestionIndex]
    this.input = this.initial
    this.cursor = this.input.length
    this.render()
  }

  suggestNext() {
    this.suggestionIndex = (this.suggestionIndex + 1) % this.suggestions.length
    this.suggest()
  }

  suggestPrev() {
    this.suggestionIndex =
      (this.suggestionIndex - 1 + this.suggestions.length) %
      this.suggestions.length
    this.suggest()
  }

  next() {
    if (this.cursor === this.input.length) {
      this.suggestNext()
    } else {
      this.completion()
    }
  }

  completion() {
    this.input = this.initial
    this.cursor = this.input.length
    return this.render()
  }

  up() {
    this.suggestPrev()
  }
  down() {
    this.suggestNext()
  }
}

declare module 'enquirer' {
  class _Prompt extends Enquirer.Prompt {
    constructor(...args: any[])
    initial: string
    input: string
    cursor: number
  }

  class StringPrompt extends _Prompt {}
}
