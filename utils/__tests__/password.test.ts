import { describe, it, expect } from 'vitest'
import { generatePassword } from '../password'

describe('generatePassword', () => {
  it('generates password with default options', () => {
    const password = generatePassword()
    expect(password).toHaveLength(12)
    expect(password).toMatch(/[0-9]/) // has numbers
    expect(password).toMatch(/[!@#$%^&*()_+]/) // has symbols
    expect(password).toMatch(/[a-z]/) // has lowercase
    expect(password).toMatch(/[A-Z]/) // has uppercase
  })

  it('respects custom length', () => {
    const password = generatePassword({ length: 16 })
    expect(password).toHaveLength(16)
  })

  it('generates password with only numbers', () => {
    const password = generatePassword({
      numbers: true,
      symbols: false,
      lowercase: false,
      uppercase: false
    })
    expect(password).toMatch(/^[0-9]+$/)
  })

  it('generates password with only lowercase', () => {
    const password = generatePassword({
      numbers: false,
      symbols: false,
      lowercase: true,
      uppercase: false
    })
    expect(password).toMatch(/^[a-z]+$/)
  })

  it('generates unique passwords', () => {
    const password1 = generatePassword()
    const password2 = generatePassword()
    expect(password1).not.toBe(password2)
  })
})