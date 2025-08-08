import { useState, useRef, useEffect } from 'react'
import { Palette } from 'lucide-react'
import { useTheme, ColorScheme } from '../hooks/useTheme'

const colorSchemes: { name: ColorScheme; label: string; color: string }[] = [
  { name: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { name: 'green', label: 'Green', color: 'bg-green-500' },
  { name: 'purple', label: 'Purple', color: 'bg-purple-500' },
  { name: 'orange', label: 'Orange', color: 'bg-orange-500' },
  { name: 'pink', label: 'Pink', color: 'bg-pink-500' },
]

export default function ColorSchemeSelector() {
  const { colorScheme, setColorScheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSchemeSelect = (scheme: ColorScheme) => {
    setColorScheme(scheme)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 
                   transition-colors duration-200"
        aria-label="Change color scheme"
      >
        <Palette className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                        rounded-lg shadow-lg z-10 min-w-[120px]">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">Color Scheme</div>
            {colorSchemes.map((scheme) => (
              <button
                key={scheme.name}
                onClick={() => handleSchemeSelect(scheme.name)}
                className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  colorScheme === scheme.name ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${scheme.color}`} />
                <span className="text-gray-700 dark:text-gray-300">{scheme.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
