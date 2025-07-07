import {
  tNoMacro,
  msgNoMacro,
  defineMessageNoMacro,
  pluralNoMacro,
  selectNoMacro,
  selectOrdinalNoMacro,
} from "./noMacro"
import { i18n } from "./index"

describe("noMacro", () => {
  beforeEach(() => {
    i18n.loadAndActivate({
      locale: "en",
      messages: {},
    })
  })

  describe("tNoMacro", () => {
    it("should return translated string for simple message", () => {
      const result = tNoMacro`Hello world`
      expect(result).toBe("Hello world")
    })

    it("should handle message with named variables using object syntax", () => {
      const name = "John"
      const result = tNoMacro`Hello ${{ name }}`
      expect(result).toBe("Hello John")
    })

    it("should handle message with multiple named variables", () => {
      const firstName = "John"
      const lastName = "Doe"
      const result = tNoMacro`Hello ${{ firstName }} ${{ lastName }}`
      expect(result).toBe("Hello John Doe")
    })

    it("should generate correct IDs internally (verified via catalog)", () => {
      i18n.loadAndActivate({
        locale: "en",
        messages: {
          OVaF9k: "Bonjour {name}",
          zHdIA5: "Salut {firstName} {lastName}",
          "1nGWAC": "Bonjour le monde",
        },
      })

      const name = "Marie"
      const result1 = tNoMacro`Hello ${{ name }}`
      expect(result1).toBe("Bonjour Marie")

      const firstName = "Jean"
      const lastName = "Dupont"
      const result2 = tNoMacro`Hello ${{ firstName }} ${{ lastName }}`
      expect(result2).toBe("Salut Jean Dupont")

      const result3 = tNoMacro`Hello world`
      expect(result3).toBe("Bonjour le monde")

      i18n.loadAndActivate({
        locale: "en",
        messages: {},
      })
    })

    it("should throw error for positional arguments", () => {
      const name = "John"
      expect(() => {
        return tNoMacro`Hello ${name}`
      }).toThrow(
        "noMacro functions only support object notation. Use ${{variableName}} instead of ${variable}"
      )
    })

    it("should handle complex expressions in named variables", () => {
      const user = { name: "John" }
      const result = tNoMacro`Hello ${{ name: user.name }}`
      expect(result).toBe("Hello John")
    })

    it("should handle function calls in variables", () => {
      const getName = () => "John"
      const result = tNoMacro`Hello ${{ name: getName() }}`
      expect(result).toBe("Hello John")
    })

    it("should work with message descriptor syntax", () => {
      const name = "John"
      const result = tNoMacro({
        message: "Hello {name}",
        values: { name },
      })
      expect(result).toBe("Hello John")
    })

    it("should work with message descriptor with custom id", () => {
      const name = "Alice"
      const result = tNoMacro({
        id: "custom.greeting",
        message: "Hello {name}",
        values: { name },
      })
      expect(result).toBe("Hello Alice")
    })

    it("should work with message descriptor with context", () => {
      const result = tNoMacro({
        message: "Save",
        context: "button",
      })
      expect(result).toBe("Save")
    })

    it("should work with message descriptor with comment", () => {
      const result = tNoMacro({
        message: "Hello world",
        comment: "Greeting message",
      })
      expect(result).toBe("Hello world")
    })

    it("should throw error for invalid descriptor arguments", () => {
      expect(() => tNoMacro(null as any)).toThrow(
        "tNoMacro requires either a template literal or an object with a 'message' property"
      )
      expect(() => tNoMacro(undefined as any)).toThrow(
        "tNoMacro requires either a template literal or an object with a 'message' property"
      )
      expect(() => tNoMacro("string" as any)).toThrow(
        "tNoMacro requires either a template literal or an object with a 'message' property"
      )
      expect(() => tNoMacro(42 as any)).toThrow(
        "tNoMacro requires either a template literal or an object with a 'message' property"
      )
      expect(() => tNoMacro({} as any)).toThrow(
        "tNoMacro requires either a template literal or an object with a 'message' property"
      )
      expect(() => tNoMacro({ id: "test" } as any)).toThrow(
        "tNoMacro requires either a template literal or an object with a 'message' property"
      )
    })
  })

  describe("msgNoMacro", () => {
    it("should return MessageDescriptor", () => {
      const name = "John"
      const result = msgNoMacro`Hello ${{ name }}`
      expect(result).toEqual({
        id: "OVaF9k",
        message: "Hello {name}",
        values: { name: "John" },
      })

      expect(i18n._(result)).toBe("Hello John")
    })

    it("should be an alias for defineMessageNoMacro", () => {
      expect(msgNoMacro).toBe(defineMessageNoMacro)
    })

    it("should work with descriptor syntax like defineMessageNoMacro", () => {
      const result = msgNoMacro({
        id: "test.msg",
        message: "Test {value}",
        values: { value: "works" },
      })

      expect(result).toEqual({
        id: "test.msg",
        message: "Test {value}",
        values: { value: "works" },
      })

      expect(i18n._(result)).toBe("Test works")
    })
  })

  describe("defineMessageNoMacro", () => {
    it("should return MessageDescriptor with provided values", () => {
      const result = defineMessageNoMacro({
        id: "custom.id",
        message: "Hello {name}",
        values: { name: "John" },
      })
      expect(result).toEqual({
        id: "custom.id",
        message: "Hello {name}",
        values: { name: "John" },
      })

      expect(i18n._(result)).toBe("Hello John")
    })

    it("should generate id if not provided", () => {
      const result = defineMessageNoMacro({
        message: "Hello world",
      })
      expect(result).toEqual({
        id: "1nGWAC",
        message: "Hello world",
        values: undefined,
      })

      expect(i18n._(result)).toBe("Hello world")
    })

    it("should generate different IDs for same message with different contexts", () => {
      const resultWithContext = defineMessageNoMacro({
        message: "Save",
        context: "button",
      })

      const resultWithoutContext = defineMessageNoMacro({
        message: "Save",
      })

      expect(resultWithContext.id).toBe("z6v0vJ")
      expect(resultWithoutContext.id).toBe("tfDRzk")
      expect(resultWithContext.id).not.toBe(resultWithoutContext.id)
    })

    it("should handle context", () => {
      const result = defineMessageNoMacro({
        message: "Save",
        context: "button",
      })
      expect(result).toEqual({
        id: "z6v0vJ",
        message: "Save",
        values: undefined,
      })

      expect(i18n._(result)).toBe("Save")
    })

    it("should handle comment", () => {
      const result = defineMessageNoMacro({
        message: "Hello world",
        comment: "Greeting message",
      })
      expect(result).toEqual({
        id: "1nGWAC",
        message: "Hello world",
        comment: "Greeting message",
        values: undefined,
      })

      expect(i18n._(result)).toBe("Hello world")
    })

    it("should work with template literal syntax", () => {
      const name = "Alice"
      const result = defineMessageNoMacro`Hello ${{ name }}`
      expect(result).toEqual({
        id: "OVaF9k",
        message: "Hello {name}",
        values: { name: "Alice" },
      })

      expect(i18n._(result)).toBe("Hello Alice")

      const newResult = defineMessageNoMacro`Hello`

      expect(newResult).toEqual({
        id: "uzTaYi",
        message: "Hello",
        values: {},
      })
    })

    it("should throw error for invalid arguments", () => {
      expect(() => defineMessageNoMacro(null as any)).toThrow(
        "defineMessageNoMacro requires either a template literal or an object with a 'message' property"
      )
      expect(() => defineMessageNoMacro(undefined as any)).toThrow(
        "defineMessageNoMacro requires either a template literal or an object with a 'message' property"
      )
      expect(() => defineMessageNoMacro("string" as any)).toThrow(
        "defineMessageNoMacro requires either a template literal or an object with a 'message' property"
      )
      expect(() => defineMessageNoMacro(42 as any)).toThrow(
        "defineMessageNoMacro requires either a template literal or an object with a 'message' property"
      )
      expect(() => defineMessageNoMacro({} as any)).toThrow(
        "defineMessageNoMacro requires either a template literal or an object with a 'message' property"
      )
      expect(() => defineMessageNoMacro({ id: "test" } as any)).toThrow(
        "defineMessageNoMacro requires either a template literal or an object with a 'message' property"
      )
    })
  })

  describe("ICU functions", () => {
    describe("pluralNoMacro", () => {
      it("should handle basic plural", () => {
        const count = 5
        const result = tNoMacro`You have ${{
          books: pluralNoMacro(
            { count },
            {
              one: "# book",
              other: "# books",
            }
          ),
        }}`
        expect(result).toBe("You have 5 books")
      })

      it("should handle plural with offset", () => {
        const count = 3
        const result = pluralNoMacro(
          { count },
          {
            offset: 1,
            "=0": "No books",
            one: "# book",
            other: "# books",
          }
        )
        expect(result).toBe("2 books")
      })

      it("should handle plural with exact matches", () => {
        const count = 0
        const result = tNoMacro`You have ${{
          books: pluralNoMacro(
            { count },
            {
              "=0": "no books",
              "=1": "one book",
              other: "# books",
            }
          ),
        }}`
        expect(result).toBe("You have no books")
      })

      it("should throw error for positional notation", () => {
        const count = 5
        expect(() => {
          return tNoMacro`You have ${(pluralNoMacro as any)(count, {
            one: "# book",
            other: "# books",
          })}`
        }).toThrow("pluralNoMacro requires object notation")
      })
    })

    describe("selectNoMacro", () => {
      it("should handle basic select", () => {
        const gender = "male"
        const result = selectNoMacro(
          { gender },
          {
            male: "He is here",
            female: "She is here",
            other: "They are here",
          }
        )
        expect(result).toBe("He is here")
      })

      it("should handle select with mixed parameters", () => {
        const gender = "female"
        const name = "Alice"
        const result = tNoMacro`${{ name }} says: ${{
          message: selectNoMacro(
            { gender },
            {
              male: "I am a man",
              female: "I am a woman",
              other: "I am a person",
            }
          ),
        }}`
        expect(result).toBe("Alice says: I am a woman")
      })
    })

    describe("selectOrdinalNoMacro", () => {
      it("should handle basic selectOrdinal", () => {
        const position = 2
        const result = tNoMacro`You finished ${{
          place: selectOrdinalNoMacro(
            { position },
            {
              one: "#st",
              two: "#nd",
              few: "#rd",
              other: "#th",
            }
          ),
        }}`
        expect(result).toBe("You finished 2nd")
      })

      it("should handle selectOrdinal with offset", () => {
        const position = 5
        const result = selectOrdinalNoMacro(
          { position },
          {
            offset: 1,
            one: "#st place",
            other: "#th place",
          }
        )
        expect(result).toBe("4th place")
      })
    })

    describe("nested ICU expressions", () => {
      it("should handle multiple ICU functions", () => {
        const count = 2
        const gender = "female"
        const result = tNoMacro`${{
          pronoun: selectNoMacro(
            { gender },
            {
              male: "He has",
              female: "She has",
              other: "They have",
            }
          ),
        }} ${{
          books: pluralNoMacro(
            { count },
            {
              one: "# book",
              other: "# books",
            }
          ),
        }}`
        expect(result).toBe("She has 2 books")
      })
    })
  })

  describe("Object notation enforcement", () => {
    it("should only accept object notation for regular variables", () => {
      const name = "John"

      expect(tNoMacro`Hello ${{ name }}`).toBe("Hello John")

      expect(() => {
        return tNoMacro`Hello ${name}`
      }).toThrow("noMacro functions only support object notation")
    })

    it("should only accept object notation for ICU functions", () => {
      const count = 5

      expect(
        tNoMacro`You have ${{
          books: pluralNoMacro(
            { count },
            {
              one: "# book",
              other: "# books",
            }
          ),
        }}`
      ).toBe("You have 5 books")

      expect(() => {
        return tNoMacro`You have ${{
          books: (pluralNoMacro as any)(count, {
            one: "# book",
            other: "# books",
          }),
        }}`
      }).toThrow("pluralNoMacro requires object notation")

      expect(() => {
        return tNoMacro`You have ${pluralNoMacro(
          { count },
          {
            one: "# book",
            other: "# books",
          }
        )}`
      }).toThrow("noMacro functions only support object notation")
    })
  })

  describe("Integration tests", () => {
    it("should work end-to-end with complex ICU expressions", () => {
      const userCount = 3
      const gender = "female"

      const result = tNoMacro`${{
        pronoun: selectNoMacro(
          { gender },
          {
            male: "He invited",
            female: "She invited",
            other: "They invited",
          }
        ),
      }} ${{
        people: pluralNoMacro(
          { userCount },
          {
            one: "# person",
            other: "# people",
          }
        ),
      }} to the party`

      expect(result).toBe("She invited 3 people to the party")
    })

    it("should work with loaded translations", () => {
      i18n.loadAndActivate({
        locale: "en",
        messages: {
          OVaF9k: "Hola {name}",
        },
      })

      const name = "World"
      const result = tNoMacro`Hello ${{ name }}`
      expect(result).toBe("Hola World")

      i18n.loadAndActivate({
        locale: "en",
        messages: {},
      })
    })
  })
})
