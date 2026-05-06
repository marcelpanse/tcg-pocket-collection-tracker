import { useSearchParams } from 'react-router'
import { z } from 'zod'

function tryParseJson(val: string): unknown {
  try {
    const parsed = JSON.parse(val)
    return parsed === null ? val : parsed
  } catch {
    return val
  }
}

function getFieldType(field: z.ZodType): 'array' | 'boolean' | 'number' | 'string' | 'unknown' {
  // Unwrap ZodDefault
  let unwrapped: z.ZodTypeAny = field as z.ZodTypeAny
  if (unwrapped instanceof z.ZodDefault) {
    unwrapped = unwrapped.unwrap() as z.ZodTypeAny
  }

  // Check for array
  if (unwrapped instanceof z.ZodArray) {
    return 'array'
  }

  // Check for boolean
  if (unwrapped instanceof z.ZodBoolean) {
    return 'boolean'
  }

  // Check for number types
  if (unwrapped instanceof z.ZodNumber || (unwrapped instanceof z.ZodUnion && unwrapped.options.some((opt) => opt instanceof z.ZodNumber))) {
    return 'number'
  }

  // Check for string types
  if (unwrapped instanceof z.ZodString || (unwrapped instanceof z.ZodUnion && unwrapped.options.some((opt) => opt instanceof z.ZodString))) {
    return 'string'
  }

  return 'unknown'
}

function getArrayElementType(field: z.ZodType): 'string' | 'number' | 'unknown' {
  let unwrapped: z.ZodTypeAny = field as z.ZodTypeAny
  if (unwrapped instanceof z.ZodDefault) {
    unwrapped = unwrapped.unwrap() as z.ZodTypeAny
  }

  if (unwrapped instanceof z.ZodArray) {
    const elementType = unwrapped.element

    if (elementType instanceof z.ZodString) {
      return 'string'
    }
    if (elementType instanceof z.ZodNumber) {
      return 'number'
    }
    if (elementType instanceof z.ZodEnum || elementType instanceof z.ZodLiteral || elementType instanceof z.ZodUnion) {
      // Enums and unions typically contain strings
      return 'string'
    }
  }

  return 'unknown'
}

export default function useSearchState<T extends z.ZodObject>(schema: T): [z.infer<T>, (updates: Partial<z.infer<T>>) => void, number] {
  const [searchParams, setSearchParams] = useSearchParams()

  const setValues = (updates: Partial<z.infer<T>>) => {
    const params = new URLSearchParams(searchParams)
    for (const key in updates) {
      const val = updates[key]
      const field = schema.shape[key] as z.ZodType

      if (field === undefined) {
        console.warn(`useSearchState(): Unknown key '${key}'`)
        continue
      }

      const fieldType = getFieldType(field)

      if (fieldType === 'array') {
        if (!Array.isArray(val)) {
          console.warn(`useSearchState(): ${key} should be an array`)
          continue
        }
        if (val.length === 0) {
          params.delete(key)
        } else {
          params.set(key, val.join(','))
        }
      } else {
        if (val === field.parse(undefined)) {
          params.delete(key)
        } else {
          params.set(key, String(val))
        }
      }
    }
    setSearchParams(params)
  }

  const obj = Object.fromEntries(
    Object.entries(schema.shape).map(([key, field]) => {
      if (!searchParams.has(key)) {
        return [key, undefined]
      }

      const fieldType = getFieldType(field)
      const paramValue = searchParams.get(key) as string

      if (fieldType === 'array') {
        const elementType = getArrayElementType(field)
        const elements = paramValue.split(',')

        if (elementType === 'string') {
          // For string arrays, keep elements as strings
          return [key, elements]
        } else if (elementType === 'number') {
          // For number arrays, parse each element as number
          return [key, elements.map(tryParseJson)]
        } else {
          // For unknown element types, try to parse
          return [key, elements.map(tryParseJson)]
        }
      } else if (fieldType === 'boolean') {
        return [key, paramValue === 'true']
      } else if (fieldType === 'number') {
        return [key, tryParseJson(paramValue)]
      } else {
        // For strings and unknown types, keep as string
        return [key, paramValue]
      }
    }),
  )

  const count = Object.keys(schema.shape).filter((key) => searchParams.has(key)).length

  return [schema.parse(obj), setValues, count]
}
