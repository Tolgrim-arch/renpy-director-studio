import { create } from 'zustand';

export interface Beat {
  id: string;
  actors: Actor[];
  dialogue?: { characterName: string; text: string };
  transition?: string;
}

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
  // Interaction State
  interactionMode: 'drag' | 'rotate' | 'scale' | null;
  setInteractionMode: (mode: 'drag' | 'rotate' | 'scale' | null) => void;
  draggingActor: string | null;
  setDraggingActor: (id: string | null) => void;
  editingDialogueId: string | null;
  setEditingDialogue: (id: string | null) => void;
  setBeatDialogue: (characterName: string, text: string) => void;

  // Scene State
  beats: Beat[];
  currentBeatIndex: number;
  addBeat: () => void;
  removeBeat: (index: number) => void;
  setCurrentBeat: (index: number) => void;
  selectedActorId: string | null;
  assets: Asset[];
  draggedAsset: Asset | null;
  addActor: (actor: Omit<Actor, 'id'>) => void;
  updateActor: (id: string, updates: Partial<Actor>) => void;
  removeActor: (id: string) => void;
  reorderActor: (id: string, direction: 'front' | 'forward' | 'backward' | 'back') => void;
  selectActor: (id: string | null) => void;
  
  // UI State
  activeWorkspace: 'director' | 'nodes' | 'shaders' | 'code';
  setWorkspace: (ws: 'director' | 'nodes' | 'shaders' | 'code') => void;

  // Assets State
  setAssets: (assets: Asset[]) => void;
  setDraggedAsset: (asset: Asset | null) => void;

  // Advanced State
  clipboardActor: Actor | null;
  projectResolution: { w: number, h: number };
  setClipboard: (actor: Actor | null) => void;
  setProjectResolution: (w: number, h: number) => void;
}

export const useStore = create<AppState>((set) => ({
  interactionMode: null,
  setInteractionMode: (mode) => set({ interactionMode: mode }),
  draggingActor: null,
  setDraggingActor: (id) => set({ draggingActor: id }),
  editingDialogueId: null,
  setEditingDialogue: (id) => set({ editingDialogueId: id }),

  beats: [
    {
      id: Math.random().toString(36).substring(7),
      actors: [
        { id: '1', name: 'bg_classroom.png', type: 'background', x: 0.5, y: 0.5, zoom: 1.0 },
        { id: '2', name: 'aiko_smile.png', type: 'character', x: 0.5, y: 1.0, zoom: 1.0 }
      ]
    }
  ],
  currentBeatIndex: 0,
  selectedActorId: null,
  activeWorkspace: 'director',
  assets: [],
  draggedAsset: null,

  addActor: (actor) => set((state) => {
    const newBeats = [...state.beats];
    const currentActors = [...newBeats[state.currentBeatIndex].actors];
    currentActors.push({ ...actor, id: Math.random().toString(36).substring(7) });
    newBeats[state.currentBeatIndex] = { ...newBeats[state.currentBeatIndex], actors: currentActors };
    return { beats: newBeats };
  }),

  selectActor: (id) => set({ selectedActorId: id }),

  updateActor: (id, updates) => set((state) => {
    const newBeats = [...state.beats];
    const currentActors = newBeats[state.currentBeatIndex].actors.map(a => a.id === id ? { ...a, ...updates } : a);
    newBeats[state.currentBeatIndex] = { ...newBeats[state.currentBeatIndex], actors: currentActors };
    return { beats: newBeats };
  }),

  removeActor: (id) => set((state) => {
    const newBeats = [...state.beats];
    const currentActors = newBeats[state.currentBeatIndex].actors.filter(a => a.id !== id);
    newBeats[state.currentBeatIndex] = { ...newBeats[state.currentBeatIndex], actors: currentActors };
    return { 
      beats: newBeats,
      selectedActorId: state.selectedActorId === id ? null : state.selectedActorId
    };
  }),

  reorderActor: (id, direction) => set((state) => {
    const newBeats = [...state.beats];
    const currentActors = [...newBeats[state.currentBeatIndex].actors];
    const currentIndex = currentActors.findIndex(a => a.id === id);
    if (currentIndex === -1) return state;
    
    const [actor] = currentActors.splice(currentIndex, 1);
    
    if (direction === 'front') {
      currentActors.push(actor);
    } else if (direction === 'back') {
      currentActors.unshift(actor);
    } else if (direction === 'forward') {
      currentActors.splice(Math.min(currentActors.length, currentIndex + 1), 0, actor);
    } else if (direction === 'backward') {
      currentActors.splice(Math.max(0, currentIndex - 1), 0, actor);
    }
    
    newBeats[state.currentBeatIndex] = { ...newBeats[state.currentBeatIndex], actors: currentActors };
    return { beats: newBeats };
  }),

  setWorkspace: (ws) => set({ activeWorkspace: ws }),
  
  setBeatDialogue: (characterName, text) => set((state) => {
    const newBeats = [...state.beats];
    newBeats[state.currentBeatIndex] = {
      ...newBeats[state.currentBeatIndex],
      dialogue: { characterName, text }
    };
    return { beats: newBeats, editingDialogueId: null };
  }),

  addBeat: () => set((state) => {
    const currentBeat = state.beats[state.currentBeatIndex];
    const clonedActors = JSON.parse(JSON.stringify(currentBeat.actors));
    const newBeat = {
      id: Math.random().toString(36).substring(7),
      actors: clonedActors
    };
    const newBeats = [...state.beats];
    newBeats.splice(state.currentBeatIndex + 1, 0, newBeat);
    return { beats: newBeats, currentBeatIndex: state.currentBeatIndex + 1 };
  }),

  removeBeat: (index) => set((state) => {
    if (state.beats.length <= 1) return state;
    const newBeats = [...state.beats];
    newBeats.splice(index, 1);
    const newIndex = Math.min(state.currentBeatIndex, newBeats.length - 1);
    return { beats: newBeats, currentBeatIndex: newIndex };
  }),

  setCurrentBeat: (index) => set({ currentBeatIndex: index }),
  
  setAssets: (assets) => set({ assets }),
  setDraggedAsset: (asset) => set({ draggedAsset: asset }),
  
  clipboardActor: null,
  projectResolution: { w: 1920, h: 1080 },
  setClipboard: (actor) => set({ clipboardActor: actor }),
  setProjectResolution: (w, h) => set({ projectResolution: { w, h } })
}));

export const useCurrentActors = () => useStore(state => state.beats[state.currentBeatIndex]?.actors || []);

