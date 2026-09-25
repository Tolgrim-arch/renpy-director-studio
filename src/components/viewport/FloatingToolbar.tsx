import React, { useEffect, useRef } from 'react';
import { useStore, useCurrentActors } from '../../store/useStore';
import { Lock, Unlock, CopyPlus, Trash, MoreHorizontal, RefreshCw } from 'lucide-react';

interface FloatingToolbarProps {
  stageRef: React.RefObject<HTMLDivElement>;
  interactionStartRef: React.MutableRefObject<{ cx: number, cy: number, initialVal: number, initialDist: number }>;
  onOpenContextMenu: (rect: DOMRect, actorId: string) => void;
}

export function FloatingToolbar({ stageRef, interactionStartRef, onOpenContextMenu }: FloatingToolbarProps) {
  const actors = useCurrentActors();
  const { selectedActorId, updateActor, addActor, removeActor, interactionMode, setInteractionMode } = useStore();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const pivotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedActorId) return;
    
    let animationFrameId: number;
    const updateUI = () => {
      const el = document.getElementById(`actor-wrapper-${selectedActorId}`);
      if (el && toolbarRef.current && pivotRef.current && stageRef.current) {
        const rect = el.getBoundingClientRect();
        const stage = stageRef.current.getBoundingClientRect();
        
        let tx = rect.left + rect.width / 2;
        if (tx < stage.left + 100) tx = stage.left + 100;
        if (tx > stage.right - 100) tx = stage.right - 100;
        
        let ty = rect.top - 50;
        let py = rect.bottom + 30;
        let px = rect.left + rect.width / 2;
        if (px < stage.left + 15) px = stage.left + 15;
        if (px > stage.right - 15) px = stage.right - 15;
        
        if (ty < stage.top + 10) ty = stage.top + 10;
        if (ty > stage.bottom - 50) ty = stage.bottom - 50;
        if (py < stage.top + 10) py = stage.top + 10;
        if (py > stage.bottom - 40) py = stage.bottom - 40;
        
        if (Math.abs(py - ty) < 45) {
            py = ty + 45;
            if (py > stage.bottom - 40) {
                py = stage.bottom - 40;
                ty = py - 45;
            }
        }
        
        toolbarRef.current.style.left = `${tx}px`;
        toolbarRef.current.style.top = `${ty}px`;
        pivotRef.current.style.left = `${px}px`;
        pivotRef.current.style.top = `${py}px`;
      }
      animationFrameId = requestAnimationFrame(updateUI);
    };
    
    animationFrameId = requestAnimationFrame(updateUI);
    return () => cancelAnimationFrame(animationFrameId);
  }, [selectedActorId, stageRef]);

  if (!selectedActorId) return null;
  const actor = actors.find(a => a.id === selectedActorId);
  if (!actor) return null;

  const isLocked = actor.locked ?? false;
  const rot = actor.rotation ?? 0;

  return (
    <>
      <div 
        ref={toolbarRef}
        className="fixed -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 flex items-center justify-center text-gray-700 pointer-events-auto z-[9999]"
        style={{ height: '36px', padding: '0 6px', gap: '12px', borderRadius: '8px' }}
      >
        <button title="Bloquear" onClick={(e) => { e.stopPropagation(); updateActor(actor.id, { locked: !isLocked }) }} className="hover:text-blue-500 transition-colors">
          {isLocked ? <Lock size={18} className="text-red-500" /> : <Unlock size={18} />}
        </button>
        <button title="Duplicar" onClick={(e) => { e.stopPropagation(); addActor({ ...actor, x: actor.x + 0.05, y: actor.y + 0.05 }) }} className="hover:text-blue-500 transition-colors">
          <CopyPlus size={18} />
        </button>
        <button title="Eliminar" onClick={(e) => { e.stopPropagation(); removeActor(actor.id) }} className="hover:text-red-500 transition-colors">
          <Trash size={18} />
        </button>
        <div className="w-px h-5 bg-gray-200" />
        <button title="Más Opciones..." className="hover:text-blue-500 transition-colors" onClick={(e) => { 
          e.stopPropagation(); 
          const rect = e.currentTarget.getBoundingClientRect(); 
          onOpenContextMenu(rect, actor.id);
        }}>
          <MoreHorizontal size={18} />
        </button>
      </div>
      
      {!isLocked && (
        <div 
          ref={pivotRef}
          className="fixed -translate-x-1/2 bg-white text-gray-400 rounded-full shadow-lg flex items-center justify-center border-[#8b3dff] hover:bg-[#8b3dff] hover:text-white transition-colors pointer-events-auto z-[9999]"
          style={{ width: '24px', height: '24px', borderWidth: '1px', cursor: 'grab' }}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (!stageRef.current) return;
            setInteractionMode('rotate');
            const rect = stageRef.current.getBoundingClientRect();
            const cx = rect.left + actor.x * rect.width;
            const cy = rect.top + actor.y * rect.height;
            interactionStartRef.current = { cx, cy, initialVal: rot, initialDist: 0 };
          }}
        >
          <RefreshCw size={12} />
        </div>
      )}
      
      {!isLocked && interactionMode === 'rotate' && pivotRef.current && (
        <div 
          className="fixed bg-[#111] text-white rounded shadow-lg flex items-center justify-center font-mono pointer-events-none z-[9999]" 
          style={{ 
            top: `${parseFloat(pivotRef.current.style.top || '0')}px`,
            left: `${parseFloat(pivotRef.current.style.left || '0') + 20}px`, 
            padding: '2px 6px', fontSize: '11px', borderRadius: '3px', fontWeight: 500 
          }}
        >
          {Math.round(rot)}°
        </div>
      )}
    </>
  );
}
