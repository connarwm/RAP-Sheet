import { useState, useEffect } from 'react'

export type Theme = 'light' | 'dark'
export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'pink'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme')
    return (saved as Theme) || 'dark'
  })

  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem('colorScheme')
    return (saved as ColorScheme) || 'blue'
  })

  // Initialize classes on mount
  useEffect(() => {
    const root = window.document.documentElement
    
    // Apply initial theme
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Apply initial color scheme
    root.classList.remove('scheme-blue', 'scheme-green', 'scheme-purple', 'scheme-orange', 'scheme-pink')
    root.classList.add(`scheme-${colorScheme}`)
  }, []) // Run only on mount

  useEffect(() => {
    const root = window.document.documentElement
    
    // Apply theme class
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all color scheme classes
    root.classList.remove('scheme-blue', 'scheme-green', 'scheme-purple', 'scheme-orange', 'scheme-pink')
    // Add current color scheme class
    root.classList.add(`scheme-${colorScheme}`)
    
    localStorage.setItem('colorScheme', colorScheme)
  }, [colorScheme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  return { theme, toggleTheme, colorScheme, setColorScheme }
}
