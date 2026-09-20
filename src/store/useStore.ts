import { create } from 'zustand';

interface Actor {
  id: string;
  name: string;
  type: 'character' | 'background' | 'overlay';
  x: number;
  y: number;
  zoom: number;
}

interface AppState {
  // Scene State
  actors: Actor[];
  selectedActorId: string | null;
  addActor: (actor: Omit<Actor, 'id'>) => void;
  selectActor: (id: string | null) => void;
  updateActor: (id: string, data: Partial<Actor>) => void;
  
  // UI State
  activeWorkspace: 'director' | 'nodes' | 'shaders' | 'code';
  setWorkspace: (ws: 'director' | 'nodes' | 'shaders' | 'code') => void;
}

export const useStore = create<AppState>((set) => ({
  actors: [
    { id: '1', name: 'bg_classroom.png', type: 'background', x: 0.5, y: 0.5, zoom: 1.0 },
    { id: '2', name: 'aiko_smile.png', type: 'character', x: 0.5, y: 1.0, zoom: 1.0 }
  ],
  selectedActorId: null,
  activeWorkspace: 'director',

  addActor: (actor) => set((state) => ({
    actors: [...state.actors, { ...actor, id: Math.random().toString(36).substring(7) }]
  })),

  selectActor: (id) => set({ selectedActorId: id }),

  updateActor: (id, data) => set((state) => ({
    actors: state.actors.map(a => a.id === id ? { ...a, ...data } : a)
  })),

  setWorkspace: (ws) => set({ activeWorkspace: ws })
}));
