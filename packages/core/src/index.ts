export { setupI18n, I18n } from "./i18n"

export type {
  AllMessages,
  MessageDescriptor,
  Messages,
  AllLocaleData,
  LocaleData,
  Locale,
  Locales,
  MessageOptions,
} from "./i18n"

// Default i18n object
export { i18n } from "./globalI18n"

import * as formats from "./formats"
export { formats }

// No macro versions
export {
  tNoMacro,
  msgNoMacro,
  defineMessageNoMacro,
  pluralNoMacro,
  selectNoMacro,
  selectOrdinalNoMacro,
} from "./noMacro"
