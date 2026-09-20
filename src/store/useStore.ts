import { create } from 'zustand';

export interface Actor {
  id: string;
  name: string;
  type: 'character' | 'background' | 'item';
  x: number;
  y: number;
  zoom: number;
  rotation?: number; // En grados
  alpha?: number; // 0.0 a 1.0
  locked?: boolean;
  zIndex?: number;
  path?: string; // Para cargar desde disco local
}

interface Asset {
  name: string;
  path: string;
}

interface AppState {
  // Scene State
  actors: Actor[];
  selectedActorId: string | null;
  assets: Asset[];
  draggedAsset: Asset | null;
  addActor: (actor: Omit<Actor, 'id'>) => void;
  updateActor: (id: string, updates: Partial<Actor>) => void;
  removeActor: (id: string) => void;
  selectActor: (id: string | null) => void;
  
  // UI State
  activeWorkspace: 'director' | 'nodes' | 'shaders' | 'code';
  setWorkspace: (ws: 'director' | 'nodes' | 'shaders' | 'code') => void;

  // Assets State
  setAssets: (assets: Asset[]) => void;
  setDraggedAsset: (asset: Asset | null) => void;
}

export const useStore = create<AppState>((set) => ({
  actors: [
    { id: '1', name: 'bg_classroom.png', type: 'background', x: 0.5, y: 0.5, zoom: 1.0 },
    { id: '2', name: 'aiko_smile.png', type: 'character', x: 0.5, y: 1.0, zoom: 1.0 }
  ],
  selectedActorId: null,
  activeWorkspace: 'director',
  assets: [],
  draggedAsset: null,

  addActor: (actor) => set((state) => ({
    actors: [...state.actors, { ...actor, id: Math.random().toString(36).substring(7) }]
  })),

  selectActor: (id) => set({ selectedActorId: id }),

  updateActor: (id, updates) => set((state) => ({
    actors: state.actors.map(a => a.id === id ? { ...a, ...updates } : a)
  })),

  removeActor: (id) => set((state) => ({
    actors: state.actors.filter(a => a.id !== id),
    selectedActorId: state.selectedActorId === id ? null : state.selectedActorId
  })),

  setWorkspace: (ws) => set({ activeWorkspace: ws }),
  
  setAssets: (assets) => set({ assets }),
  setDraggedAsset: (asset) => set({ draggedAsset: asset })
}));
