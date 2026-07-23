import { describe, it, expect } from 'vitest'
import { OrderRunFormSchema, OrderFormSchema } from '../src/models/schemas'

describe('OrderRunFormSchema', () => {
  const valid = {
    name: 'Alice',
    email: 'alice@example.com',
    location: 'Taco Place',
    max: 5,
  }

  it('accepts a well-formed order run', () => {
    const result = OrderRunFormSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = OrderRunFormSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'email')).toBe(true)
    }
  })

  it('rejects a missing required field', () => {
    const { name: _name, ...withoutName } = valid
    const result = OrderRunFormSchema.safeParse(withoutName)
    expect(result.success).toBe(false)
  })

  it('rejects max when it is not a number', () => {
    const result = OrderRunFormSchema.safeParse({ ...valid, max: '5' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'max')).toBe(true)
    }
  })
})

describe('OrderFormSchema', () => {
  it('accepts a well-formed order', () => {
    const result = OrderFormSchema.safeParse({ name: 'Bob', order: 'Burrito' })
    expect(result.success).toBe(true)
  })

  it('rejects a missing order field', () => {
    const result = OrderFormSchema.safeParse({ name: 'Bob' })
    expect(result.success).toBe(false)
  })
})
