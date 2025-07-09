import { describe, it, expect, beforeEach } from 'vitest'
import { isDark, toggleDark, LIGHT, DARK } from '../index'

describe('Theme utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('isDark', () => {
    it('returns false when localStorage is empty', () => {
      expect(isDark()).toBe(false)
    })

    it('returns true when theme is set in localStorage', () => {
      localStorage.setItem('theme', DARK)
      expect(isDark()).toBe(true)
    })
  })

  describe('toggleDark', () => {
    it('sets dark theme when true', () => {
      toggleDark(true)
      expect(localStorage.getItem('theme')).toBe(DARK)
    })

    it('sets light theme when false', () => {
      toggleDark(false)
      expect(localStorage.getItem('theme')).toBe(LIGHT)
    })
  })

  describe('constants', () => {
    it('has correct theme values', () => {
      expect(LIGHT).toBe('corporate')
      expect(DARK).toBe('night')
    })
  })
})