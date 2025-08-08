import { useCallback, useState } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import * as ExcelJS from 'exceljs'
import Papa from 'papaparse'
import { CableLink } from '../types'
import { sanitizeCellValue, validateFileSize, validateFileType, fileUploadLimiter } from '../utils/security'

interface FileUploadProps {
  onDataLoaded: (data: CableLink[]) => void
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFileData = useCallback((data: any[][]) => {
    try {
      if (data.length < 2) {
        throw new Error('File must contain at least a header row and one data row')
      }

      const headers = data[0].map(h => h?.toString().toLowerCase().trim())
      const requiredHeaders = ['startrack', 'startuheight', 'startport', 'endrack', 'enduheight', 'endport']
      
      const missingHeaders = requiredHeaders.filter(header => 
        !headers.some(h => h.includes(header.replace('u', ' u')))
      )
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`)
      }

      const cableLinks: CableLink[] = data.slice(1).map((row, index) => {
        const getColumnValue = (searchTerms: string[]) => {
          for (const term of searchTerms) {
            const colIndex = headers.findIndex(h => h.includes(term))
            if (colIndex !== -1) return row[colIndex]?.toString().trim()
          }
          return ''
        }

        return {
          id: `link-${index + 1}`,
          startRack: sanitizeCellValue(getColumnValue(['start rack', 'startrack'])),
          startUHeight: parseInt(getColumnValue(['start u height', 'startu', 'startuheight'])) || 0,
          startPort: sanitizeCellValue(getColumnValue(['start port', 'startport'])),
          endRack: sanitizeCellValue(getColumnValue(['end rack', 'endrack'])),
          endUHeight: parseInt(getColumnValue(['end u height', 'endu', 'enduheight'])) || 0,
          endPort: sanitizeCellValue(getColumnValue(['end port', 'endport'])),
        }
      }).filter(link => link.startRack && link.endRack)

      if (cableLinks.length === 0) {
        throw new Error('No valid cable links found in the file')
      }

      onDataLoaded(cableLinks)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
    }
  }, [onDataLoaded])

  const handleFile = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      // Rate limiting check
      if (!fileUploadLimiter.canAttempt()) {
        const remainingTime = Math.ceil(fileUploadLimiter.getRemainingTime() / 1000)
        throw new Error(`Too many upload attempts. Please wait ${remainingTime} seconds.`)
      }

      // File size validation (10MB limit)
      if (!validateFileSize(file, 10)) {
        throw new Error('File size must be less than 10MB')
      }

      // File type validation
      if (!validateFileType(file, ['csv', 'xlsx', 'xls'])) {
        throw new Error('Please upload a CSV or Excel file (.csv, .xlsx, .xls)')
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase()

      if (fileExtension === 'csv') {
        Papa.parse(file, {
          complete: (results) => {
            processFileData(results.data as any[][])
            setIsLoading(false)
          },
          error: (error) => {
            setError(`CSV parse error: ${error.message}`)
            setIsLoading(false)
          }
        })
      } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
        const buffer = await file.arrayBuffer()
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(buffer)
        
        const worksheet = workbook.worksheets[0]
        const data: any[][] = []
        
        worksheet.eachRow((row) => {
          const rowData: any[] = []
          row.eachCell((cell, colNumber) => {
            rowData[colNumber - 1] = cell.value
          })
          data.push(rowData)
        })
        
        processFileData(data)
        setIsLoading(false)
      } else {
        throw new Error('Please upload a CSV or Excel file (.csv, .xlsx, .xls)')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file')
      setIsLoading(false)
    }
  }, [processFileData])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Processing file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Upload cable links file
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Drag and drop your CSV or Excel file here, or click to browse
            </p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer"
            >
              <FileText className="h-4 w-4 mr-2" />
              Choose File
            </label>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p className="font-medium mb-1">Expected file format:</p>
        <p>Columns: Start Rack, Start U Height, Start Port, End Rack, End U Height, End Port</p>
      </div>
    </div>
  )
}
