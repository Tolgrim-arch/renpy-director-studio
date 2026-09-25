import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';

interface SelectionBorderProps {
  scale: number;
  stageRef: React.RefObject<HTMLDivElement>;
  interactionStartRef: React.MutableRefObject<{ cx: number, cy: number, initialVal: number, initialDist: number }>;
}

export function SelectionBorder({ scale, stageRef, interactionStartRef }: SelectionBorderProps) {
  const { actors, selectedActorId, setInteractionMode } = useStore();
  const ghostRef = useRef<HTMLDivElement>(null);

  // Sync width/height to perfectly match the real actor via DOM measurement
  useEffect(() => {
    if (!selectedActorId) return;
    let animationFrameId: number;
    const syncSize = () => {
      const el = document.getElementById(`actor-wrapper-${selectedActorId}`);
      if (el && ghostRef.current) {
        ghostRef.current.style.width = `${el.offsetWidth}px`;
        ghostRef.current.style.height = `${el.offsetHeight}px`;
      }
      animationFrameId = requestAnimationFrame(syncSize);
    };
    animationFrameId = requestAnimationFrame(syncSize);
    return () => cancelAnimationFrame(animationFrameId);
  }, [selectedActorId]);

  if (!selectedActorId) return null;
  const actor = actors.find(a => a.id === selectedActorId);
  if (!actor) return null;

  const isLocked = actor.locked ?? false;
  const rot = actor.rotation ?? 0;
  const ui = 1 / (scale * actor.zoom);

  return (
    <div 
      ref={ghostRef}
      className="absolute flex flex-col items-center justify-center pointer-events-none z-[9998]"
      style={{
        left: `${actor.x * 100}%`,
        top: `${actor.y * 100}%`,
        transform: `translate(-50%, -50%) scale(${actor.zoom}) rotate(${rot}deg)`,
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 ${isLocked ? 'border-red-500' : 'border-[#8b3dff]'}`} style={{ borderWidth: `${2 * ui}px` }} />
        {!isLocked && (
          <>
            {[
              { top: -4 * ui, left: -4 * ui, cursor: 'nwse-resize' },
              { top: -4 * ui, right: -4 * ui, cursor: 'nesw-resize' },
              { bottom: -4 * ui, left: -4 * ui, cursor: 'nesw-resize' },
              { bottom: -4 * ui, right: -4 * ui, cursor: 'nwse-resize' }
            ].map((pos, i) => (
              <div 
                key={i} 
                className="absolute bg-white border-[#8b3dff] rounded-full pointer-events-auto" 
                style={{ ...pos, width: `${10 * ui}px`, height: `${10 * ui}px`, borderWidth: `${1 * ui}px`, cursor: pos.cursor }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  if (!stageRef.current) return;
                  setInteractionMode('scale');
                  const rect = stageRef.current.getBoundingClientRect();
                  const cx = rect.left + actor.x * rect.width;
                  const cy = rect.top + actor.y * rect.height;
                  const dx = e.clientX - cx;
                  const cy2 = e.clientY - cy;
                  interactionStartRef.current = { 
                    cx, cy, 
                    initialVal: actor.zoom, 
                    initialDist: Math.sqrt(dx*dx + cy2*cy2) 
                  };
                }}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
