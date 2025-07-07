import { MessageDescriptor } from "./i18n"
import { i18n } from "./globalI18n"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"

type TemplateStringsArray = ReadonlyArray<string>
type TemplateValues = ReadonlyArray<unknown>

type PluralOptions = {
  offset?: number
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
  [key: `=${number}`]: string
}

type SelectOptions = {
  [key: string]: string
  other: string
}

type SelectOrdinalOptions = {
  offset?: number
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
  [key: `=${number}`]: string
}

function validateAndExtractSingleKeyValue(
  value: Record<string, unknown>,
  functionName: string,
  example: string
): [string, unknown] {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).length !== 1
  ) {
    throw new Error(
      `${functionName} requires object notation, e.g., ${functionName}(${example}, options)`
    )
  }

  const entry = Object.entries(value)[0]
  if (!entry) {
    throw new Error(
      `${functionName} requires object notation, e.g., ${functionName}(${example}, options)`
    )
  }

  return entry
}

function createAndTranslateMessage(
  message: string,
  key: string,
  val: unknown
): string {
  const id = generateMessageId(message)
  const messageDescriptor: MessageDescriptor = {
    id,
    message,
    values: { [key]: val },
  }
  return i18n._(messageDescriptor)
}

function createMessageDescriptor(
  message: string,
  values?: Record<string, unknown>,
  id?: string,
  comment?: string
): MessageDescriptor {
  return {
    id: id || generateMessageId(message),
    message,
    values,
    comment,
  }
}

function formatICUOptions(
  options: Record<string, unknown>,
  supportOffset: boolean = false
): string {
  return Object.entries(options)
    .map(([k, v]) => {
      if (supportOffset && k === "offset") {
        return `offset:${v}`
      }

      if (k.startsWith("=")) {
        return `${k} {${v}}`
      }

      return `${k} {${v}}`
    })
    .join(" ")
}

function createICUExpression(
  value: Record<string, unknown>,
  options: Record<string, unknown>,
  icuType: "plural" | "select" | "selectordinal",
  functionName: string,
  example: string
): string {
  const [key, val] = validateAndExtractSingleKeyValue(
    value,
    functionName,
    example
  )

  const supportOffset = icuType === "plural" || icuType === "selectordinal"
  const formatOptions = formatICUOptions(options, supportOffset)

  const message = `{${key}, ${icuType}, ${formatOptions}}`
  return createAndTranslateMessage(message, key, val)
}

export function pluralNoMacro(
  value: Record<string, unknown>,
  options: PluralOptions
): string {
  return createICUExpression(
    value,
    options,
    "plural",
    "pluralNoMacro",
    "{ count }"
  )
}

export function selectNoMacro(
  value: Record<string, unknown>,
  options: SelectOptions
): string {
  return createICUExpression(
    value,
    options,
    "select",
    "selectNoMacro",
    "{ gender }"
  )
}

export function selectOrdinalNoMacro(
  value: Record<string, unknown>,
  options: SelectOrdinalOptions
): string {
  return createICUExpression(
    value,
    options,
    "selectordinal",
    "selectOrdinalNoMacro",
    "{ position }"
  )
}

function parseTemplateValues(
  strings: TemplateStringsArray,
  values: TemplateValues
): {
  message: string
  extractedValues: Record<string, unknown>
} {
  let message = ""
  const extractedValues: Record<string, unknown> = {}

  for (let i = 0; i < strings.length; i++) {
    message += strings[i]

    if (i < values.length) {
      const value = values[i]

      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value).length === 1
      ) {
        const entry = Object.entries(value)[0]
        if (entry) {
          const [key, val] = entry
          message += `{${key}}`
          extractedValues[key] = val
        }
      } else {
        throw new Error(
          "noMacro functions only support object notation. Use ${{variableName}} instead of ${variable}"
        )
      }
    }
  }

  return { message, extractedValues }
}

/**
 * Template literal tag function that creates translated string without macros
 *
 * Usage:
 * tNoMacro`Hello ${{name}}`
 * tNoMacro`You have ${{books: pluralNoMacro({ count }, { one: "# item", other: "# items" })}}`
 * tNoMacro`${{greeting: selectNoMacro({ gender }, { male: "He", female: "She", other: "They" })}}`
 *
 * @param strings - Template literal strings
 * @param values - Template literal values
 * @returns Translated string
 */
export function tNoMacro(
  strings: TemplateStringsArray,
  ...values: TemplateValues
): string {
  const { message, extractedValues } = parseTemplateValues(strings, values)
  const messageDescriptor = createMessageDescriptor(message, extractedValues)
  return i18n._(messageDescriptor)
}

/**
 * Helper for creating message descriptor with explicit id and context
 */
export function defineMessageNoMacro(descriptor: {
  id?: string
  message: string
  comment?: string
  context?: string
  values?: Record<string, unknown>
}): MessageDescriptor

/**
 * Template literal version of defineMessageNoMacro for creating message descriptors
 *
 * Usage:
 * defineMessageNoMacro`Hello ${{name}}`
 *
 * @param strings - Template literal strings
 * @param values - Template literal values
 * @returns MessageDescriptor for later use with i18n._()
 */
export function defineMessageNoMacro(
  strings: TemplateStringsArray,
  ...values: TemplateValues
): MessageDescriptor
export function defineMessageNoMacro(
  arg:
    | {
        id?: string
        message: string
        comment?: string
        context?: string
        values?: Record<string, unknown>
      }
    | TemplateStringsArray,
  ...values: TemplateValues
): MessageDescriptor {
  if (Array.isArray(arg) && typeof arg[0] === "string") {
    const { message, extractedValues } = parseTemplateValues(arg, values)
    return createMessageDescriptor(message, extractedValues)
  }

  if (
    typeof arg === "object" &&
    arg !== null &&
    !Array.isArray(arg) &&
    "message" in arg
  ) {
    const descriptor = arg
    const message = descriptor.message
    const providedId = descriptor.id
    const context = descriptor.context
    const messageValues = descriptor.values
    const comment = descriptor.comment

    const id =
      (typeof providedId === "string" ? providedId : undefined) ||
      generateMessageId(
        message,
        typeof context === "string" ? context : undefined
      )

    const validatedValues =
      messageValues &&
      typeof messageValues === "object" &&
      !Array.isArray(messageValues) &&
      messageValues.constructor === Object
        ? (messageValues as Record<string, unknown>)
        : undefined

    return createMessageDescriptor(
      message,
      validatedValues,
      id,
      typeof comment === "string" ? comment : undefined
    )
  } else {
    throw new Error(
      "defineMessageNoMacro requires either a template literal or an object with a 'message' property"
    )
  }
}

/**
 * Alias for defineMessageNoMacro
 * Define a message for later use
 */
export const msgNoMacro: typeof defineMessageNoMacro = defineMessageNoMacro
