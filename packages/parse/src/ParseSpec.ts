export type ParseSpec = {
  name?: string
  version?: string
  description?: string
  args?: {
    name: string
    default?: boolean | string | number
    usage?: string
    variadic?: boolean
  }[]
  flags?: Record<
    string,
    {
      type: 'boolean' | 'parameter'
      default?: boolean | string | number
      alias?: string | string[]
      usage?: string
    }
  >
  usage?: string[]
  examples?: string[]
}
