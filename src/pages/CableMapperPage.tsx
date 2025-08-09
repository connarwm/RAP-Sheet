import { useState } from "react"
import FileUpload from "../components/FileUpload"
import PatchPanelSelector from "../components/PatchPanelSelector"
import { CableLink, PatchPanel } from "../types"

export default function CableMapperPage() {
  const [cableLinks, setCableLinks] = useState<CableLink[]>([])
  const [selectedPatchPanel, setSelectedPatchPanel] = useState<PatchPanel | null>(null)

  return (
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
  )
}
