import { useState, useRef } from 'react'
import { Plus, Minus, Upload, Download, Save, X } from 'lucide-react'
import { PatchPanel, PatchPanelUnit, PatchPanelCard } from '../types'
import { patchPanelService } from '../services/patchPanelService'
import { validateTextInput, validateNumericInput, validateSelectInput } from '../utils/security'

interface PatchPanelEditorProps {
  initialPatchPanel?: PatchPanel | null
  onSave: (patchPanel: PatchPanel) => void
  onClose: () => void
}

const cardTypes = ['PSM4', 'LCLC', 'Type1', 'Type2'] as const
const linkSpeeds = ['40Gb', '100Gb'] as const

export default function PatchPanelEditor({ initialPatchPanel, onSave, onClose }: PatchPanelEditorProps) {
  const [patchPanel, setPatchPanel] = useState<PatchPanel>(
    initialPatchPanel || {
      id: `custom-${Date.now()}`,
      name: 'New Patch Panel Configuration',
      isDefault: false,
      panels: [
        {
          id: 'panel-1',
          number: 1,
          trays: [
            {
              id: 'tray-1',
              number: 1,
              cards: [
                { id: 'card-A', type: 'PSM4', ports: 4, linkSpeed: '100Gb' },
                { id: 'card-B', type: 'PSM4', ports: 4, linkSpeed: '100Gb' },
                { id: 'card-C', type: 'PSM4', ports: 4, linkSpeed: '100Gb' },
                { id: 'card-D', type: 'LCLC', ports: 6, linkSpeed: '40Gb' }
              ]
            }
          ]
        }
      ]
    }
  )

  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateName = (name: string) => {
    const validatedName = validateTextInput(name, 50)
    setPatchPanel(prev => ({ ...prev, name: validatedName }))
  }

  const addPanel = () => {
    const panels = patchPanel.panels || []
    const newPanelNumber = panels.length > 0 ? Math.max(...panels.map(p => p.number)) + 1 : 1
    if (newPanelNumber > 4) return // Max 4 panels
    
    const newPanel: PatchPanelUnit = {
      id: `panel-${newPanelNumber}`,
      number: newPanelNumber,
      trays: [
        {
          id: `tray-1`,
          number: 1,
          cards: [
            { id: 'card-A', type: 'PSM4', ports: 4, linkSpeed: '100Gb' },
            { id: 'card-B', type: 'PSM4', ports: 4, linkSpeed: '100Gb' },
            { id: 'card-C', type: 'PSM4', ports: 4, linkSpeed: '100Gb' },
            { id: 'card-D', type: 'LCLC', ports: 6, linkSpeed: '40Gb' }
          ]
        }
      ]
    }
    setPatchPanel(prev => ({
      ...prev,
      panels: [...(prev.panels || []), newPanel].sort((a, b) => a.number - b.number)
    }))
  }

  const removePanel = (panelId: string) => {
    setPatchPanel(prev => ({
      ...prev,
      panels: (prev.panels || []).filter(p => p.id !== panelId)
    }))
  }

  const addTray = (panelId: string) => {
    setPatchPanel(prev => ({
      ...prev,
      panels: (prev.panels || []).map(panel =>
        panel.id === panelId
          ? {
              ...panel,
              trays: (panel.trays || []).length < 12 ? [...(panel.trays || []), {
                id: `tray-${(panel.trays || []).length + 1}`,
                number: (panel.trays || []).length + 1,
                cards: [
                  { id: 'card-A', type: 'PSM4' as const, ports: 4, linkSpeed: '100Gb' as const },
                  { id: 'card-B', type: 'PSM4' as const, ports: 4, linkSpeed: '100Gb' as const },
                  { id: 'card-C', type: 'PSM4' as const, ports: 4, linkSpeed: '100Gb' as const },
                  { id: 'card-D', type: 'LCLC' as const, ports: 6, linkSpeed: '40Gb' as const }
                ]
              }].sort((a, b) => a.number - b.number) : (panel.trays || [])
            }
          : panel
      )
    }))
  }

  const removeTray = (panelId: string, trayId: string) => {
    setPatchPanel(prev => ({
      ...prev,
      panels: (prev.panels || []).map(panel =>
        panel.id === panelId
          ? {
              ...panel,
              trays: (panel.trays || []).filter(t => t.id !== trayId)
            }
          : panel
      )
    }))
  }

  const updateCard = (panelId: string, trayId: string, cardIndex: number, card: Partial<PatchPanelCard>) => {
    // Validate input data
    const validatedCard = {
      ...card,
      type: card.type ? validateSelectInput(card.type, ['PSM4', 'LCLC', 'Custom']) : undefined,
      ports: card.ports ? validateNumericInput(card.ports, 1, 24) : undefined,
      linkSpeed: card.linkSpeed ? validateSelectInput(card.linkSpeed, ['1Gb', '10Gb', '25Gb', '40Gb', '100Gb']) : undefined
    }
    
    setPatchPanel(prev => ({
      ...prev,
      panels: (prev.panels || []).map(panel =>
        panel.id === panelId
          ? {
              ...panel,
              trays: (panel.trays || []).map(tray =>
                tray.id === trayId
                  ? {
                      ...tray,
                      cards: (tray.cards || []).map((c, index) =>
                        index === cardIndex ? { ...c, ...validatedCard } : c
                      )
                    }
                  : tray
              )
            }
          : panel
      )
    }))
  }

  const handleSave = () => {
    // If editing a default configuration, generate a new ID for the user version
    const isDefaultConfig = patchPanelService.isDefaultConfiguration(patchPanel.id)
    const configToSave = isDefaultConfig 
      ? { ...patchPanel, id: `custom-${Date.now()}` }
      : patchPanel
    
    patchPanelService.saveUserConfiguration(configToSave)
    onSave(configToSave)
  }

  const exportToCSV = () => {
    const csv = patchPanelService.exportToCSV(patchPanel)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${patchPanel.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportCSV = () => {
    fileInputRef.current?.click()
  }

  const processCSVFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string
        const importedPanel = patchPanelService.importFromCSV(csvContent, patchPanel.name)
        setPatchPanel(prev => ({
          ...prev,
          panels: importedPanel.panels
        }))
      } catch (error) {
        alert('Error importing CSV: ' + (error as Error).message)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Patch Panel Editor</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Panel Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Panel Name
            </label>
            <input
              type="text"
              value={patchPanel.name}
              onChange={(e) => updateName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter panel name"
            />
          </div>

          {/* Import/Export Controls */}
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={handleImportCSV}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={processCSVFile}
              className="hidden"
            />
          </div>

          {/* Panels */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">Patch Panels</h4>
              <button
                onClick={addPanel}
                disabled={(patchPanel.panels || []).length >= 4}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Panel ({(patchPanel.panels || []).length}/4)
              </button>
            </div>

            <div className="space-y-6">
              {(patchPanel.panels || []).map((panel) => (
                <div key={panel.id} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-gray-900">Panel {panel.number}</h5>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addTray(panel.id)}
                        disabled={(panel.trays || []).length >= 12}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Tray ({(panel.trays || []).length}/12)
                      </button>
                      {(patchPanel.panels || []).length > 1 && (
                        <button
                          onClick={() => removePanel(panel.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(panel.trays || []).slice().reverse().map((tray) => (
                      <div key={tray.id} className="bg-white rounded-lg p-3 border">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="font-medium text-sm text-gray-800">Tray {tray.number}</h6>
                          {(panel.trays || []).length > 1 && (
                            <button
                              onClick={() => removeTray(panel.id, tray.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {(tray.cards || []).map((card, cardIndex) => {
                            const cardLetter = String.fromCharCode(65 + cardIndex)
                            return (
                              <div key={card.id} className="bg-gray-50 rounded p-2 border">
                                <div className="text-xs font-medium text-gray-700 mb-2 text-center">
                                  Card {cardLetter}
                                </div>
                                <div className="space-y-1">
                                  <select
                                    value={card.type}
                                    onChange={(e) => updateCard(panel.id, tray.id, cardIndex, { 
                                      type: e.target.value as PatchPanelCard['type']
                                    })}
                                    className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    {cardTypes.map(type => (
                                      <option key={type} value={type}>
                                        {type}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={card.ports}
                                    onChange={(e) => updateCard(panel.id, tray.id, cardIndex, { 
                                      ports: parseInt(e.target.value) || 1
                                    })}
                                    className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Ports"
                                  />
                                  <select
                                    value={card.linkSpeed}
                                    onChange={(e) => updateCard(panel.id, tray.id, cardIndex, { 
                                      linkSpeed: e.target.value as PatchPanelCard['linkSpeed']
                                    })}
                                    className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    {linkSpeeds.map(speed => (
                                      <option key={speed} value={speed}>
                                        {speed}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="mt-1 text-xs text-gray-500 text-center">
                                  {card.ports}p @ {card.linkSpeed}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  )
}
