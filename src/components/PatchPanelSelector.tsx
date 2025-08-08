import { useState, useEffect } from 'react'
import { Settings, Plus, Copy, Trash2 } from 'lucide-react'
import { PatchPanel } from '../types'
import { patchPanelService } from '../services/patchPanelService'
import PatchPanelEditor from './PatchPanelEditor'

interface PatchPanelSelectorProps {
  onPatchPanelSelected: (patchPanel: PatchPanel) => void
  selectedPatchPanel: PatchPanel | null
}

export default function PatchPanelSelector({ onPatchPanelSelected, selectedPatchPanel }: PatchPanelSelectorProps) {
  const [showEditor, setShowEditor] = useState(false)
  const [editingPanel, setEditingPanel] = useState<PatchPanel | null>(null)
  const [availablePatchPanels, setAvailablePatchPanels] = useState<PatchPanel[]>([])

  useEffect(() => {
    setAvailablePatchPanels(patchPanelService.getAllConfigurations())
  }, [])

  const handlePatchPanelSelect = (patchPanel: PatchPanel) => {
    onPatchPanelSelected(patchPanel)
  }

  const handleEditPanel = (patchPanel?: PatchPanel) => {
    setEditingPanel(patchPanel || null)
    setShowEditor(true)
  }

  const handleSavePanel = (savedPanel: PatchPanel) => {
    setAvailablePatchPanels(patchPanelService.getAllConfigurations())
    onPatchPanelSelected(savedPanel)
    setShowEditor(false)
    setEditingPanel(null)
  }

  const handleCloseEditor = () => {
    setShowEditor(false)
    setEditingPanel(null)
  }



  const handleEditCopy = (patchPanel: PatchPanel) => {
    const copy = patchPanelService.createCopyOfDefault(patchPanel.id)
    handleEditPanel(copy)
  }

  const handleDeletePanel = (patchPanel: PatchPanel, e: React.MouseEvent) => {
    e.stopPropagation()
    if (patchPanel.isDefault) return
    
    if (confirm(`Are you sure you want to delete "${patchPanel.name}"? This action cannot be undone.`)) {
      patchPanelService.deleteUserConfiguration(patchPanel.id)
      setAvailablePatchPanels(patchPanelService.getAllConfigurations())
      
      // If the deleted panel was selected, clear the selection
      if (selectedPatchPanel?.id === patchPanel.id) {
        onPatchPanelSelected(patchPanelService.getDefaultConfigurations()[0])
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availablePatchPanels.map((patchPanel) => (
          <div
            key={patchPanel.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPatchPanel?.id === patchPanel.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-700'
                : patchPanel.isDefault
                ? 'scheme-border-primary scheme-bg-card hover:shadow-md'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
            }`}
            onClick={() => handlePatchPanelSelect(patchPanel)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">{patchPanel.name}</h3>
              <div className="flex items-center gap-2">
                {patchPanel.isDefault && (
                  <span className="px-2 py-1 text-xs scheme-text-on-colored scheme-bg-primary rounded-full">
                    Default
                  </span>
                )}
                {!patchPanel.isDefault && (
                  <button
                    onClick={(e) => handleDeletePanel(patchPanel, e)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete configuration"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-900 dark:text-white space-y-1">
              <p>{(patchPanel.panels || []).length} panel{(patchPanel.panels || []).length > 1 ? 's' : ''}</p>
              <div className="mt-2 space-y-1">
                {(patchPanel.panels || []).slice().sort((a, b) => b.number - a.number).map((panel) => (
                  <div key={panel.id} className="border-l-2 border-gray-400 dark:border-gray-500 pl-2">
                    <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">Panel {panel.number}</div>
                    {(panel.trays || []).slice().reverse().map((tray) => (
                      <div key={tray.id} className="text-xs text-gray-800 dark:text-gray-200 flex justify-between">
                        <span>Tray {tray.number}:</span>
                        <span>
                          {(tray.cards || []).map((card, cardIndex) => {
                            const cardLetter = String.fromCharCode(65 + cardIndex);
                            return `${cardLetter}(${card.type})`;
                          }).join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex flex-col items-center justify-center"
          onClick={() => handleEditPanel()}
        >
          <Plus className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Create Custom Panel</span>
        </div>
      </div>

      {selectedPatchPanel && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Selected: {selectedPatchPanel.name}</h4>
            <div className="flex gap-2">
              {selectedPatchPanel.isDefault ? (
                <button
                  onClick={() => handleEditCopy(selectedPatchPanel)}
                  className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Edit Copy
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleEditPanel(selectedPatchPanel)}
                    className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => handleDeletePanel(selectedPatchPanel, e)}
                    className="inline-flex items-center text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            {(selectedPatchPanel.panels || []).slice().sort((a, b) => b.number - a.number).map((panel) => (
              <div key={panel.id} className="bg-white dark:bg-gray-700 rounded p-3 border border-gray-200 dark:border-gray-600">
                <div className="font-medium text-sm text-gray-900 dark:text-white mb-3 text-center">
                  Panel {panel.number}
                </div>
                <div className="space-y-2">
                  {(panel.trays || []).slice().reverse().map((tray) => (
                    <div key={tray.id} className="bg-gray-50 dark:bg-gray-600 rounded p-3 border border-gray-200 dark:border-gray-500">
                      <div className="font-medium text-xs text-gray-900 dark:text-white mb-2 text-center">
                        Tray {tray.number}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {(tray.cards || []).map((card, cardIndex) => {
                          const cardLetter = String.fromCharCode(65 + cardIndex); // A, B, C, D
                          return (
                            <div key={card.id} className="bg-white dark:bg-gray-500 rounded p-2 border border-gray-200 dark:border-gray-400">
                              <div className="text-xs font-medium text-center mb-2 text-gray-900 dark:text-white">
                                Card {cardLetter} ({card.type}@{card.linkSpeed})
                              </div>
                              <div className="flex flex-wrap gap-1 justify-center">
                                {Array.from({ length: card.ports }, (_, portIndex) => (
                                  <div
                                    key={portIndex}
                                    className="w-5 h-5 scheme-port-bg border scheme-port-border rounded-sm flex items-center justify-center text-xs font-mono scheme-port-text"
                                    title={`T${tray.number}${cardLetter}${portIndex + 1}`}
                                  >
                                    {portIndex + 1}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showEditor && (
        <PatchPanelEditor
          initialPatchPanel={editingPanel}
          onSave={handleSavePanel}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  )
}
