import React, { useEffect, useRef, useState } from 'react';
import { useStore, useCurrentActors } from '../../store/useStore';

export function SpeechBubbleInput() {
  const actors = useCurrentActors();
  const { editingDialogueId, setEditingDialogue, setBeatDialogue, beats, currentBeatIndex } = useStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  const actor = actors.find(a => a.id === editingDialogueId);
  
  // Extract previous dialogue if any
  const currentDialogue = beats[currentBeatIndex]?.dialogue;
  const initialText = currentDialogue && currentDialogue.characterName === actor?.name.replace(/\.[^/.]+$/, "") 
    ? currentDialogue.text 
    : '';

  const [text, setText] = useState(initialText);

  // Sync position relative to the actor DOM element
  useEffect(() => {
    if (!editingDialogueId) return;
    
    let animationFrameId: number;
    const syncPosition = () => {
      const el = document.getElementById(`actor-wrapper-${editingDialogueId}`);
      const viewportEl = document.getElementById('rds-viewport'); // Stage parent with fixed absolute bounds
      
      if (el && viewportEl && bubbleRef.current) {
        const rect = el.getBoundingClientRect();
        const viewportRect = viewportEl.getBoundingClientRect();
        
        // Compute raw top-center coords relative to the viewport
        const top = rect.top - viewportRect.top;
        const centerX = rect.left + rect.width / 2 - viewportRect.left;
        
        bubbleRef.current.style.left = `${centerX}px`;
        bubbleRef.current.style.top = `${top - 20}px`; // 20px offset above the head
      }
      animationFrameId = requestAnimationFrame(syncPosition);
    };
    
    animationFrameId = requestAnimationFrame(syncPosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, [editingDialogueId]);

  // Focus and select all on mount
  useEffect(() => {
    if (editingDialogueId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  }, [editingDialogueId]);

  if (!editingDialogueId || !actor) return null;

  const handleCommit = () => {
    if (text.trim() === '') {
      // If empty, we could remove the dialogue, but for now we just close it
      setEditingDialogue(null);
      return;
    }
    const cleanName = actor.name.replace(/\.[^/.]+$/, "");
    setBeatDialogue(cleanName, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Escape') {
      setEditingDialogue(null);
    }
  };

  return (
    <>
      <div 
        className="absolute inset-0 z-[99998] bg-black/30 backdrop-blur-[1px] transition-all"
        onMouseDown={(e) => { e.stopPropagation(); handleCommit(); }}
      />
      
      <div 
        ref={bubbleRef}
        className="absolute z-[99999] pointer-events-auto transform -translate-x-1/2 -translate-y-full"
      >
        <div className="relative bg-white text-black p-4 rounded-2xl shadow-2xl border-4 border-black w-64">
          <div className="font-black mb-1 uppercase text-xs tracking-wider border-b-2 border-black/10 pb-1">
            {actor.name.replace(/\.[^/.]+$/, "")}
          </div>
          
          <textarea
            ref={inputRef}
            className="w-full bg-transparent border-none outline-none resize-none text-sm font-medium leading-tight h-16 custom-scrollbar"
            placeholder="Escribe el diálogo aquí... (Enter para guardar)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onMouseDown={(e) => e.stopPropagation()}
            autoFocus
          />

          {/* Speech Bubble Tail */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-t-[16px] border-t-black border-r-[10px] border-r-transparent">
             <div className="absolute -top-[18px] -left-[6px] w-0 h-0 border-l-[6px] border-l-transparent border-t-[10px] border-t-white border-r-[6px] border-r-transparent" />
          </div>
        </div>
      </div>
    </>
  );
}
