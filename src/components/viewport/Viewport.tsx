import { useStore } from '../../store/useStore';
import { User, Image as ImageIcon } from 'lucide-react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useEffect, useRef, useState } from 'react';
import { SelectionBorder } from './SelectionBorder';
import { ContextMenu } from './ContextMenu';
import { FloatingToolbar } from './FloatingToolbar';
import { ActorNode } from './ActorNode';

export default function Viewport() {
  const { actors, selectedActorId, selectActor, addActor, updateActor, removeActor, draggedAsset, setDraggedAsset, interactionMode, setInteractionMode, draggingActor, setDraggingActor } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const interactionStart = useRef({ cx: 0, cy: 0, initialVal: 0, initialDist: 0 });
  const [scale, setScale] = useState(1);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, actorId: string} | null>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        const scaleX = width / 1920;
        const scaleY = height / 1080;
        setScale(Math.min(scaleX, scaleY));
      }
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedActorId) return;
      const actor = useStore.getState().actors.find(a => a.id === selectedActorId);
      if (!actor) return;

      const step = e.shiftKey ? 0.05 : 0.005; 
      let { x, y } = actor;

      if (e.target instanceof HTMLElement && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }

      switch(e.key) {
        case 'ArrowUp': y -= step; break;
        case 'ArrowDown': y += step; break;
        case 'ArrowLeft': x -= step; break;
        case 'ArrowRight': x += step; break;
        case 'Delete':
        case 'Backspace':
          useStore.getState().removeActor(selectedActorId);
          return;
        default: return;
      }
      
      e.preventDefault();
      useStore.getState().updateActor(selectedActorId, { 
        x: Math.max(0, Math.min(1, x)), 
        y: Math.max(0, Math.min(1, y)) 
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedActorId]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    let asset = draggedAsset;
    if (!asset) {
      try {
        const data = e.dataTransfer.getData('text/plain');
        if (data) asset = JSON.parse(data);
      } catch(err) {}
    }
    
    if (asset) {
      let dropX = 0.5;
      let dropY = 0.5;
      
      if (stageRef.current) {
        const rect = stageRef.current.getBoundingClientRect();
        dropX = (e.clientX - rect.left) / rect.width;
        dropY = (e.clientY - rect.top) / rect.height;
      }
      
      addActor({
        name: asset.name,
        type: 'character',
        x: Math.max(0, Math.min(1, dropX)),
        y: Math.max(0, Math.min(1, dropY)),
        zoom: 1.0,
        path: asset.path,
      });
      setDraggedAsset(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!stageRef.current || !selectedActorId) return;

    if (interactionMode === 'rotate') {
      const dx = e.clientX - interactionStart.current.cx;
      const dy = e.clientY - interactionStart.current.cy;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle = (angle + 270) % 360;
      if (angle > 180) angle -= 360;

      // Snapping
      if (e.shiftKey) {
        angle = Math.round(angle / 15) * 15;
      } else {
        if (Math.abs(angle) < 4) angle = 0;
        else if (Math.abs(angle - 90) < 4) angle = 90;
        else if (Math.abs(angle + 90) < 4) angle = -90;
        else if (Math.abs(angle - 180) < 4 || Math.abs(angle + 180) < 4) angle = 180;
      }

      updateActor(selectedActorId, { rotation: Math.round(angle) });
    } 
    else if (interactionMode === 'scale') {
      const dx = e.clientX - interactionStart.current.cx;
      const dy = e.clientY - interactionStart.current.cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const zoom = interactionStart.current.initialVal * (dist / interactionStart.current.initialDist);
      updateActor(selectedActorId, { zoom: Math.max(0.1, Math.min(3, zoom)) });
    }
    else if (interactionMode === 'drag' && draggingActor) {
      const rect = stageRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - dragOffset.current.x;
      const y = (e.clientY - rect.top) / rect.height - dragOffset.current.y;
      updateActor(draggingActor, { 
        x: Math.max(0, Math.min(1, x)), 
        y: Math.max(0, Math.min(1, y)) 
      });
    }
  };

  return (
    <div 
      className="flex-1 overflow-hidden flex items-center justify-center p-4 relative" 
      onClick={() => { selectActor(null); setContextMenu(null); }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
      onMouseUp={() => { setDraggingActor(null); setInteractionMode(null); }}
      onMouseLeave={() => { setDraggingActor(null); setInteractionMode(null); }}
      ref={containerRef}
    >
      <div 
        className="relative bg-[#111111] shadow-2xl ring-1 ring-rds-border overflow-hidden"
        style={{ width: 1920 * scale, height: 1080 * scale }}
      >
        <div 
          ref={stageRef}
          className="absolute origin-top-left"
          style={{ width: 1920, height: 1080, transform: `scale(${scale})` }}
        >
          {actors.map(actor => (
            <ActorNode 
              key={actor.id} 
              actorId={actor.id} 
              stageRef={stageRef as React.RefObject<HTMLDivElement>} 
              dragOffset={dragOffset}
              onOpenContextMenu={(e) => setContextMenu({ x: e.clientX, y: e.clientY, actorId: actor.id })}
              onCloseContextMenu={() => setContextMenu(null)}
            />
          ))}
          
          <SelectionBorder scale={scale} stageRef={stageRef as React.RefObject<HTMLDivElement>} interactionStartRef={interactionStart} />
        </div>
      </div>
      
      <FloatingToolbar 
        stageRef={stageRef as React.RefObject<HTMLDivElement>} 
        interactionStartRef={interactionStart} 
        onOpenContextMenu={(rect, actorId) => setContextMenu({ x: rect.left, y: rect.bottom + 10, actorId })} 
      />
      
      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          actorId={contextMenu.actorId} 
          onClose={() => setContextMenu(null)} 
        />
      )}
    </div>
  );
}
