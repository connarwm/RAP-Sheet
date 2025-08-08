import { PatchPanel } from '../types'
import patchPanelData from '../data/patch-panels.json'

interface PatchPanelData {
  defaultConfigurations: PatchPanel[]
  userConfigurations: PatchPanel[]
}

const STORAGE_KEY = 'user_patch_panels'

export class PatchPanelService {
  private static instance: PatchPanelService
  private userConfigurations: PatchPanel[] = []

  private constructor() {
    this.loadUserConfigurations()
  }

  static getInstance(): PatchPanelService {
    if (!PatchPanelService.instance) {
      PatchPanelService.instance = new PatchPanelService()
    }
    return PatchPanelService.instance
  }

  getDefaultConfigurations(): PatchPanel[] {
    return (patchPanelData as PatchPanelData).defaultConfigurations
  }

  getUserConfigurations(): PatchPanel[] {
    return this.userConfigurations
  }

  isDefaultConfiguration(id: string): boolean {
    return this.getDefaultConfigurations().some(config => config.id === id)
  }

  getAllConfigurations(): PatchPanel[] {
    const defaults = this.getDefaultConfigurations()
    const users = this.getUserConfigurations()
    
    // Filter out defaults that have been customized by the user
    const userIds = new Set(users.map(config => config.id))
    const filteredDefaults = defaults.filter(config => !userIds.has(config.id))
    
    return [...filteredDefaults, ...users]
  }

  saveUserConfiguration(patchPanel: PatchPanel): void {
    const existingIndex = this.userConfigurations.findIndex(config => config.id === patchPanel.id)
    
    if (existingIndex >= 0) {
      this.userConfigurations[existingIndex] = patchPanel
    } else {
      this.userConfigurations.push(patchPanel)
    }
    
    this.saveToLocalStorage()
  }

  deleteUserConfiguration(id: string): void {
    this.userConfigurations = this.userConfigurations.filter(config => config.id !== id)
    this.saveToLocalStorage()
  }

  private loadUserConfigurations(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.userConfigurations = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load user configurations:', error)
      this.userConfigurations = []
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.userConfigurations))
    } catch (error) {
      console.error('Failed to save user configurations:', error)
    }
  }

  createCopyOfDefault(defaultId: string, newName?: string): PatchPanel {
    const defaultConfig = this.getDefaultConfigurations().find(config => config.id === defaultId)
    if (!defaultConfig) {
      throw new Error('Default configuration not found')
    }

    return {
      ...defaultConfig,
      id: `custom-${Date.now()}`,
      name: newName || `Copy of ${defaultConfig.name}`,
      isDefault: false
    }
  }

  exportToCSV(patchPanel: PatchPanel): string {
    const headers = ['panel_number', 'tray_number', 'card_position', 'card_type', 'port_count', 'link_speed']
    const rows = [headers.join(',')]

    patchPanel.panels.forEach(panel => {
      panel.trays.forEach(tray => {
        tray.cards.forEach((card, cardIndex) => {
          const cardPosition = String.fromCharCode(65 + cardIndex) // A, B, C, D
          rows.push([panel.number, tray.number, cardPosition, card.type, card.ports, card.linkSpeed].join(','))
        })
      })
    })

    return rows.join('\n')
  }

  importFromCSV(csvContent: string, name: string): PatchPanel {
    const lines = csvContent.trim().split('\n')
    const dataLines = lines.slice(1) // Skip header
    
    const panelMap = new Map<number, Map<number, { cards: any[], number: number }>>()
    
    dataLines.forEach(line => {
      const [panelNumber, trayNumber, cardPosition, cardType, portCount, linkSpeed] = line.split(',')
      const panelNum = parseInt(panelNumber)
      const trayNum = parseInt(trayNumber)
      const cardIndex = cardPosition.charCodeAt(0) - 65 // A=0, B=1, C=2, D=3
      
      if (!panelMap.has(panelNum)) {
        panelMap.set(panelNum, new Map())
      }
      
      const trayMap = panelMap.get(panelNum)!
      if (!trayMap.has(trayNum)) {
        trayMap.set(trayNum, { cards: [], number: trayNum })
      }
      
      const tray = trayMap.get(trayNum)!
      tray.cards[cardIndex] = {
        id: `card-${cardPosition}`,
        type: cardType,
        ports: parseInt(portCount),
        linkSpeed: linkSpeed || '100Gb' // Default to 100Gb if not specified
      }
    })
    
    const panels = Array.from(panelMap.entries()).map(([panelNum, trayMap]) => ({
      id: `panel-${panelNum}`,
      number: panelNum,
      trays: Array.from(trayMap.values()).map(tray => ({
        id: `tray-${tray.number}`,
        number: tray.number,
        cards: tray.cards.filter(card => card) // Remove empty slots
      })).sort((a, b) => a.number - b.number)
    })).sort((a, b) => a.number - b.number)
    
    return {
      id: `custom-${Date.now()}`,
      name,
      isDefault: false,
      panels
    }
  }
}

export const patchPanelService = PatchPanelService.getInstance()
