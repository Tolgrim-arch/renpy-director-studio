import { useStore } from '../../store/useStore';
import { Play, SkipBack, SkipForward, Plus, MessageSquare, Trash2, ArrowRight } from 'lucide-react';

export default function Timeline() {
  const { beats, currentBeatIndex, addBeat, removeBeat, setCurrentBeat } = useStore();

  return (
    <div className="h-32 bg-rds-panel border-t border-rds-border flex flex-col shrink-0">
      <div className="h-8 bg-rds-header px-3 flex items-center justify-between border-b border-rds-border">
        <div className="flex items-center space-x-1">
          <button className="p-1 hover:bg-rds-panel rounded text-rds-text"><SkipBack size={14} /></button>
          <button className="p-1 hover:bg-rds-panel rounded text-rds-text"><Play size={14} /></button>
          <button className="p-1 hover:bg-rds-panel rounded text-rds-text"><SkipForward size={14} /></button>
        </div>
        <div className="text-xs font-mono text-rds-text-muted">
          Beat {currentBeatIndex + 1} / {beats.length}
        </div>
      </div>
      <div className="flex-1 p-2 flex items-center overflow-x-auto space-x-2">
        {beats.map((beat, index) => (
          <div 
            key={beat.id}
            onClick={() => setCurrentBeat(index)}
            className={`relative w-48 h-full rounded border-2 cursor-pointer flex flex-col overflow-hidden transition-colors ${index === currentBeatIndex ? 'border-rds-accent bg-rds-accent/10' : 'border-rds-border bg-rds-header hover:border-white/20'}`}
          >
            <div className="flex items-center justify-between px-2 py-1 bg-black/20 border-b border-black/20">
              <span className="text-[10px] font-bold text-white/50">BEAT {index + 1}</span>
              <div className="flex gap-1">
                {beats.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeBeat(index); }}
                    className="text-white/20 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 p-2 flex flex-col gap-1 justify-center relative">
              <div className="flex text-xs text-white/70 items-center gap-2">
                <span className="w-16 truncate">Characters:</span> 
                <span className="font-mono text-white/40">{beat.actors.filter(a => a.type === 'character').length}</span>
              </div>
              
              {beat.dialogue ? (
                <div className="flex gap-1 text-[10px] items-center text-rds-accent truncate mt-1">
                  <MessageSquare size={10} />
                  <span className="font-bold">{beat.dialogue.characterName}:</span>
                  <span className="truncate">{beat.dialogue.text}</span>
                </div>
              ) : (
                <div className="text-[10px] text-white/20 italic mt-1">Sin diálogo</div>
              )}
            </div>
          </div>
        ))}
        
        <button 
          onClick={addBeat}
          className="w-12 h-full rounded border-2 border-dashed border-rds-border hover:border-rds-accent hover:text-rds-accent text-rds-border flex items-center justify-center transition-colors shrink-0"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}
