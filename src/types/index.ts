export interface CableLink {
  id: string;
  startRack: string;
  startUHeight: number;
  startPort: string;
  endRack: string;
  endUHeight: number;
  endPort: string;
}

export interface PatchPanel {
  id: string;
  name: string;
  isDefault?: boolean;
  panels: PatchPanelUnit[];
}

export interface PatchPanelUnit {
  id: string;
  number: number;
  trays: PatchPanelTray[];
}

export interface PatchPanelTray {
  id: string;
  number: number;
  cards: PatchPanelCard[];
}

export interface PatchPanelCard {
  id: string;
  type: 'PSM4' | 'LCLC' | 'Type1' | 'Type2';
  ports: number;
  linkSpeed: '40Gb' | '100Gb';
}

export interface CableMap {
  originalLinks: CableLink[];
  mappedConnections: MappedConnection[];
  patchPanel: PatchPanel;
}

export interface MappedConnection {
  id: string;
  originalLinkId: string;
  segments: ConnectionSegment[];
}

export interface ConnectionSegment {
  id: string;
  from: ConnectionPoint;
  to: ConnectionPoint;
}

export interface ConnectionPoint {
  type: 'rack' | 'patch_panel';
  rack?: string;
  uHeight?: number;
  port?: string;
  trayId?: string;
  cardId?: string;
  patchPort?: number;
}
