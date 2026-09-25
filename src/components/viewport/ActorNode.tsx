import React from 'react';
import { useStore, useCurrentActors } from '../../store/useStore';
import { User, Image as ImageIcon } from 'lucide-react';
import { convertFileSrc } from '@tauri-apps/api/core';

interface ActorNodeProps {
  actorId: string;
  stageRef: React.RefObject<HTMLDivElement>;
  dragOffset: React.MutableRefObject<{ x: number, y: number }>;
  onOpenContextMenu: (e: React.MouseEvent) => void;
  onCloseContextMenu: () => void;
}

export function ActorNode({ actorId, stageRef, dragOffset, onOpenContextMenu, onCloseContextMenu }: ActorNodeProps) {
  const actors = useCurrentActors();
  const { selectActor, setInteractionMode, setDraggingActor } = useStore();
  const actor = actors.find(a => a.id === actorId);

  if (!actor) return null;

  const rot = actor.rotation ?? 0;
  const alf = actor.alpha ?? 1.0;
  const isLocked = actor.locked ?? false;

  return (
    <div
      id={`actor-wrapper-${actor.id}`}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        selectActor(actor.id);
        onOpenContextMenu(e);
      }}
      onMouseDown={(e) => { 
        if (e.button === 2) return; // Ignore right click for drag
        e.stopPropagation(); 
        selectActor(actor.id); 
        if (!isLocked) {
          if (stageRef.current) {
            const rect = stageRef.current.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) / rect.width;
            const mouseY = (e.clientY - rect.top) / rect.height;
            dragOffset.current = { x: mouseX - actor.x, y: mouseY - actor.y };
          }
          setInteractionMode('drag');
          setDraggingActor(actor.id); 
        }
        onCloseContextMenu();
      }}
      onClick={(e) => { e.stopPropagation(); onCloseContextMenu(); }}
      className={`absolute flex flex-col items-center justify-center transition-colors ${isLocked ? 'cursor-default' : 'cursor-move'}`}
      style={{
        left: `${actor.x * 100}%`,
        top: `${actor.y * 100}%`,
        width: 'max-content',
        height: 'max-content',
        transform: `translate(-50%, -50%) scale(${actor.zoom}) rotate(${rot}deg)`,
        opacity: alf,
        zIndex: actor.zIndex ?? 10
      }}
    >
      {actor.path ? (
        actor.path.toLowerCase().endsWith('.webm') ? (
          <video 
            id={`actor-content-${actor.id}`}
            src={convertFileSrc(actor.path)} 
            className="select-none"
            style={{ maxHeight: '1080px', maxWidth: 'none', objectFit: 'contain' }}
            autoPlay loop muted playsInline
          />
        ) : (
          <img 
            id={`actor-content-${actor.id}`}
            src={convertFileSrc(actor.path)} 
            alt={actor.name} 
            className="select-none"
            style={{ maxHeight: '1080px', maxWidth: 'none', objectFit: 'contain' }}
            draggable={false}
          />
        )
      ) : (
        <div 
          id={`actor-content-${actor.id}`}
          className="flex flex-col items-center justify-center select-none"
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
  );
}
