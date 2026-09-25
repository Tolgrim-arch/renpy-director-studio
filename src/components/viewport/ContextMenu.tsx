import React from 'react';
import { useStore, useCurrentActors } from '../../store/useStore';
import { Copy, Trash, CopyPlus, ClipboardPaste, AlignCenterVertical, AlignCenterHorizontal, AlignLeft, AlignRight, AlignStartVertical, AlignEndVertical, Image as ImageIcon, User } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  actorId: string;
  onClose: () => void;
}

export function ContextMenu({ x, y, actorId, onClose }: ContextMenuProps) {
  const actors = useCurrentActors();
  const { addActor, updateActor, removeActor, clipboardActor, setClipboard } = useStore();

  const handleAction = (action: string) => {
    if (action === 'paste' && clipboardActor) {
      addActor({ ...clipboardActor, x: clipboardActor.x + 0.05, y: clipboardActor.y + 0.05 });
      onClose();
      return;
    }

    const actor = actors.find(a => a.id === actorId);
  if (!actor) return null;
    if (!actor) return;

    switch (action) {
      case 'copy': setClipboard(actor); break;
      case 'duplicate': addActor({ ...actor, x: actor.x + 0.05, y: actor.y + 0.05 }); break;
      case 'delete': removeActor(actor.id); break;
      case 'toggle-type': {
        const isBg = actor.type === 'background';
        updateActor(actor.id, { 
          type: isBg ? 'character' : 'background',
          zIndex: isBg ? 10 : -1, // Backgrounds go to the back
          x: 0.5, y: 0.5, zoom: 1.0 // Reset transform for background
        });
        break;
      }
      case 'front': {
        const maxZ = Math.max(...actors.map(a => a.zIndex ?? 10));
        updateActor(actor.id, { zIndex: maxZ + 1 });
        break;
      }
      case 'back': {
        const minZ = Math.min(...actors.map(a => a.zIndex ?? 10));
        updateActor(actor.id, { zIndex: minZ - 1 });
        break;
      }
      case 'forward': {
        updateActor(actor.id, { zIndex: (actor.zIndex ?? 10) + 1 });
        break;
      }
      case 'backward': {
        updateActor(actor.id, { zIndex: (actor.zIndex ?? 10) - 1 });
        break;
      }
      case 'align-left': updateActor(actor.id, { x: 0 }); break;
      case 'align-center': updateActor(actor.id, { x: 0.5 }); break;
      case 'align-right': updateActor(actor.id, { x: 1 }); break;
      case 'align-top': updateActor(actor.id, { y: 0 }); break;
      case 'align-middle': updateActor(actor.id, { y: 0.5 }); break;
      case 'align-bottom': updateActor(actor.id, { y: 1 }); break;
    }
    
    onClose();
  };

  return (
    <div 
      className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl py-1.5 z-[10000] w-56 text-sm text-gray-700 flex flex-col pointer-events-auto"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <button onClick={() => handleAction('copy')} className="text-left px-4 py-1.5 hover:bg-gray-100 transition-colors flex items-center gap-3">
        <Copy size={16} className="text-gray-400"/> Copiar
      </button>
      <button onClick={() => handleAction('paste')} className="text-left px-4 py-1.5 hover:bg-gray-100 transition-colors flex items-center gap-3 disabled:opacity-50" disabled={!clipboardActor}>
        <ClipboardPaste size={16} className="text-gray-400"/> Pegar
      </button>
      <button onClick={() => handleAction('duplicate')} className="text-left px-4 py-1.5 hover:bg-gray-100 transition-colors flex items-center gap-3">
        <CopyPlus size={16} className="text-gray-400"/> Duplicar
      </button>
      <button onClick={() => handleAction('delete')} className="text-left px-4 py-1.5 hover:bg-gray-100 transition-colors flex items-center gap-3">
        <Trash size={16} className="text-gray-400"/> Eliminar
      </button>
      <div className="h-px bg-gray-200 my-1.5" />
      <button onClick={() => handleAction('toggle-type')} className="text-left px-4 py-1.5 hover:bg-gray-100 transition-colors flex items-center gap-3 font-medium">
        {actor && actor.type === 'background' ? <User size={16} className="text-gray-400" /> : <ImageIcon size={16} className="text-gray-400" />}
        {actor && actor.type === 'background' ? 'Convertir en Personaje' : 'Convertir en Fondo'}
      </button>
      
      <div className="h-px bg-gray-200 my-1.5" />
      
      {/* SUBMENU CAPAS */}
      <div className="relative group">
        <button className="w-full text-left px-4 py-1.5 hover:bg-gray-100 transition-colors flex items-center justify-between">
          <span className="flex items-center gap-3"><Copy size={16} className="text-gray-400"/> Capa</span>
          <span className="text-gray-400">▶</span>
        </button>
        <div className="absolute left-full top-0 ml-1 hidden group-hover:flex flex-col bg-white border border-gray-200 rounded-lg shadow-2xl py-1.5 w-48 z-[10001]">
          <button onClick={() => handleAction('front')} className="text-left px-4 py-1.5 hover:bg-gray-100 transition-colors">Al frente</button>
          <button onClick={() => handleAction('forward')} className="text-left px-4 py-1.5 hover:bg-gray-100 transition-colors">Delante</button>
          <button onClick={() => handleAction('backward')} className="text-left px-4 py-1.5 hover:bg-gray-100 transition-colors">Detrás</button>
          <button onClick={() => handleAction('back')} className="text-left px-4 py-1.5 hover:bg-gray-100 transition-colors">Al fondo</button>
        </div>
      </div>

      {/* SUBMENU ALINEAR */}
      <div className="relative group">
        <button className="w-full text-left px-4 py-1.5 hover:bg-gray-100 transition-colors flex items-center justify-between">
          <span className="flex items-center gap-3"><AlignCenterVertical size={16} className="text-gray-400"/> Alinear a la página</span>
          <span className="text-gray-400">▶</span>
        </button>
        <div className="absolute left-full top-0 ml-1 hidden group-hover:flex flex-col bg-white border border-gray-200 rounded-lg shadow-2xl py-1.5 w-48 z-[10001]">
          <button onClick={() => handleAction('align-left')} className="text-left px-4 py-1.5 hover:bg-gray-100 transition-colors flex items-center gap-3"><AlignLeft size={16} className="text-gray-400"/> Izquierda</button>
          <button onClick={() => handleAction('align-center')} className="text-left px-4 py-1.5 hover:bg-gray-100 transition-colors flex items-center gap-3"><AlignCenterHorizontal size={16} className="text-gray-400"/> Centro</button>
          <button onClick={() => handleAction('align-right')} className="text-left px-4 py-1.5 hover:bg-gray-100 transition-colors flex items-center gap-3"><AlignRight size={16} className="text-gray-400"/> Derecha</button>
          <div className="h-px bg-gray-100 my-1" />
          <button onClick={() => handleAction('align-top')} className="text-left px-4 py-1.5 hover:bg-gray-100 transition-colors flex items-center gap-3"><AlignStartVertical size={16} className="text-gray-400"/> Arriba</button>
          <button onClick={() => handleAction('align-middle')} className="text-left px-4 py-1.5 hover:bg-gray-100 transition-colors flex items-center gap-3"><AlignCenterVertical size={16} className="text-gray-400"/> En medio</button>
          <button onClick={() => handleAction('align-bottom')} className="text-left px-4 py-1.5 hover:bg-gray-100 transition-colors flex items-center gap-3"><AlignEndVertical size={16} className="text-gray-400"/> Abajo</button>
        </div>
      </div>
    </div>
  );
}
