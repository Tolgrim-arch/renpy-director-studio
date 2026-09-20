import { useStore } from '../store/useStore';
import { User, Image as ImageIcon } from 'lucide-react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useEffect, useRef, useState } from 'react';

export default function Viewport() {
  const { actors, selectedActorId, selectActor, addActor, updateActor, draggedAsset, setDraggedAsset } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [draggingActor, setDraggingActor] = useState<string | null>(null);

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
    if (draggingActor && stageRef.current) {
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
      onClick={() => selectActor(null)}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setDraggingActor(null)}
      onMouseLeave={() => setDraggingActor(null)}
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
          {actors.map(actor => {
            const rot = actor.rotation ?? 0;
            const alf = actor.alpha ?? 1.0;
            const isLocked = actor.locked ?? false;
            
            return (
              <div
                key={actor.id}
                onMouseDown={(e) => { 
                  e.stopPropagation(); 
                  selectActor(actor.id); 
                  if (!isLocked) {
                    if (stageRef.current) {
                      const rect = stageRef.current.getBoundingClientRect();
                      const mouseX = (e.clientX - rect.left) / rect.width;
                      const mouseY = (e.clientY - rect.top) / rect.height;
                      dragOffset.current = { x: mouseX - actor.x, y: mouseY - actor.y };
                    }
                    setDraggingActor(actor.id); 
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className={`absolute flex flex-col items-center justify-center border-2 transition-colors ${isLocked ? 'cursor-default' : 'cursor-move'} ${selectedActorId === actor.id ? 'border-rds-accent bg-rds-accent/20 z-50' : 'border-transparent hover:border-white/30'}`}
                style={{
                  left: `${actor.x * 100}%`,
                  top: `${actor.y * 100}%`,
                  transform: `translate(-50%, -50%) scale(${actor.zoom}) rotate(${rot}deg)`,
                  opacity: alf,
                  zIndex: actor.zIndex ?? 10
                }}
              >
              {actor.path ? (
                actor.path.toLowerCase().endsWith('.webm') ? (
                  <video 
                    src={convertFileSrc(actor.path)} 
                    className="select-none"
                    style={{ maxHeight: '1080px', objectFit: 'contain' }}
                    autoPlay loop muted playsInline
                  />
                ) : (
                  <img 
                    src={convertFileSrc(actor.path)} 
                    alt={actor.name} 
                    className="select-none"
                    style={{ maxHeight: '1080px', objectFit: 'contain' }}
                    draggable={false}
                  />
                )
              ) : (
                <div 
                  className="flex flex-col items-center justify-center w-full h-full select-none"
                  style={{
                    width: actor.type === 'background' ? 1920 : 400,
                    height: actor.type === 'background' ? 1080 : 800,
                    backgroundColor: actor.type === 'background' ? '#1a1a1a' : '#222',
                  }}
                >
                  {actor.type === 'character' ? <User size={64} className="text-white/50" /> : <ImageIcon size={64} className="text-white/20" />}
                  <span className="text-white/50 text-xl font-mono mt-4">{actor.name}</span>
                </div>
              )}
            </div>
          )})}
        </div>
      </div>
    </div>
  );
}
