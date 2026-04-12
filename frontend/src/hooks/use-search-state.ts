import { useSearchParams } from 'react-router'
import { z } from 'zod'

function safeJson(val: string) {
  try {
    return JSON.parse(val)
  } catch {
    return val
  }
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

      if (field instanceof z.ZodArray || (field instanceof z.ZodDefault && field.unwrap() instanceof z.ZodArray)) {
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
      if (field instanceof z.ZodArray || (field instanceof z.ZodDefault && field.unwrap() instanceof z.ZodArray)) {
        return [key, searchParams.get(key)?.split(',').map(safeJson)]
      } else {
        return [key, safeJson(searchParams.get(key) as string)]
      }
    }),
  )

  const count = Object.keys(schema.shape).filter((key) => searchParams.has(key)).length

  return [schema.parse(obj), setValues, count]
}
