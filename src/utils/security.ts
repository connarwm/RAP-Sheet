// Security utilities for file processing and data validation

/**
 * Sanitizes cell values to prevent CSV/Excel injection attacks
 */
export function sanitizeCellValue(value: string): string {
  if (!value || typeof value !== 'string') return ''
  
  // Remove dangerous formula prefixes that could execute in Excel
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r']
  const trimmed = value.trim()
  
  if (dangerousChars.some(char => trimmed.startsWith(char))) {
    return `'${trimmed}` // Prefix with quote to treat as text
  }
  
  return trimmed
}

/**
 * Validates file size before processing
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Validates file type against allowed extensions
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  return fileExtension ? allowedTypes.includes(fileExtension) : false
}

/**
 * Sanitizes strings for safe HTML rendering
 */
export function sanitizeForDisplay(value: string): string {
  if (!value || typeof value !== 'string') return ''
  
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Rate limiting for file uploads (client-side)
 */
class RateLimiter {
  private attempts: number[] = []
  private readonly maxAttempts: number
  private readonly windowMs: number

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  canAttempt(): boolean {
    const now = Date.now()
    this.attempts = this.attempts.filter(time => now - time < this.windowMs)
    
    if (this.attempts.length >= this.maxAttempts) {
      return false
    }
    
    this.attempts.push(now)
    return true
  }

  getRemainingTime(): number {
    if (this.attempts.length < this.maxAttempts) return 0
    const oldestAttempt = Math.min(...this.attempts)
    return Math.max(0, this.windowMs - (Date.now() - oldestAttempt))
  }
}

export const fileUploadLimiter = new RateLimiter(10, 60000) // 10 uploads per minute

/**
 * Validates and sanitizes text input to prevent injection attacks
 */
export function validateTextInput(value: string, maxLength: number = 100): string {
  if (!value || typeof value !== 'string') return ''
  
  // Remove dangerous characters and limit length
  const sanitized = value
    .replace(/[<>'"&]/g, '') // Remove HTML/XML dangerous chars
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/data:/gi, '') // Remove data protocol
    .trim()
    .substring(0, maxLength)
  
  return sanitized
}

/**
 * Validates numeric input
 */
export function validateNumericInput(value: string | number, min: number = 0, max: number = 1000): number {
  const num = typeof value === 'string' ? parseInt(value, 10) : value
  
  if (isNaN(num)) return min
  if (num < min) return min
  if (num > max) return max
  
  return num
}

/**
 * Validates select dropdown values against allowed options
 */
export function validateSelectInput(value: string, allowedValues: string[]): string {
  if (!value || typeof value !== 'string') return allowedValues[0] || ''
  
  return allowedValues.includes(value) ? value : allowedValues[0] || ''
}
