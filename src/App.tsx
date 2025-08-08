import { useState } from 'react'
import FileUpload from './components/FileUpload'
import PatchPanelSelector from './components/PatchPanelSelector'
import ThemeToggle from './components/ThemeToggle'
import ColorSchemeSelector from './components/ColorSchemeSelector'
import { CableLink, PatchPanel } from './types'

function App() {
  const [cableLinks, setCableLinks] = useState<CableLink[]>([])
  const [selectedPatchPanel, setSelectedPatchPanel] = useState<PatchPanel | null>(null)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Cable Mapper - RAP Generator
            </h1>
            <div className="flex items-center gap-2">
              <ColorSchemeSelector />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Step 1: Upload Cable Links</h2>
            <FileUpload onDataLoaded={setCableLinks} />
            {cableLinks.length > 0 && (
              <div className="mt-4 text-sm text-green-600 dark:text-green-400">
                Loaded {cableLinks.length} cable links
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Step 2: Select Patch Panel Configuration</h2>
            <PatchPanelSelector 
              onPatchPanelSelected={setSelectedPatchPanel}
              selectedPatchPanel={selectedPatchPanel}
            />
          </div>

          {cableLinks.length > 0 && selectedPatchPanel && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Step 3: Cable Mapping Visualization</h2>
              <div className="text-gray-500 dark:text-gray-400">
                Visual mapping interface will appear here
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
