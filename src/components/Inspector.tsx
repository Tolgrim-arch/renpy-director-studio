import { useStore } from '../store/useStore';
import { Settings2, Lock, Unlock, ArrowUpToLine, ArrowDownToLine } from 'lucide-react';

export default function Inspector() {
  const { actors, selectedActorId, updateActor } = useStore();
  
  const actor = actors.find(a => a.id === selectedActorId);

  if (!actor) {
    return (
      <aside className="w-64 bg-rds-panel flex flex-col shrink-0 border-l border-rds-border">
        <div className="flex border-b border-rds-border bg-rds-header p-2 space-x-1">
          <span className="text-xs font-semibold text-rds-text uppercase tracking-wider">Propiedades</span>
        </div>
        <div className="p-4 text-xs text-rds-accent">Ningún actor seleccionado</div>
      </aside>
    );
  }

  const rot = actor.rotation ?? 0;
  const alf = actor.alpha ?? 1.0;
  const isLocked = actor.locked ?? false;

  return (
    <aside className="w-64 bg-rds-panel flex flex-col shrink-0 border-l border-rds-border">
      <div className="flex border-b border-rds-border bg-rds-header p-2 space-x-1 items-center justify-between">
        <span className="text-xs font-semibold text-rds-text uppercase tracking-wider">Propiedades</span>
        <Settings2 size={14} className="text-rds-text-muted" />
      </div>
      
      <div className="p-4 space-y-4 overflow-y-auto">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center mb-1">
            <label className="text-rds-text-muted font-medium">Nombre</label>
            <span className="bg-rds-header px-2 py-0.5 rounded text-rds-text border border-rds-border">{actor.name}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rds-border">
            <div>
              <label className="text-rds-text-muted mb-1 block">X Pos</label>
              <input 
                type="number" step="0.01" 
                value={actor.x.toFixed(2)}
                onChange={(e) => updateActor(actor.id, { x: parseFloat(e.target.value) })}
                className="w-full bg-rds-header border border-rds-border rounded px-2 py-1 focus:border-rds-accent outline-none transition-colors"
                disabled={isLocked}
              />
            </div>
            <div>
              <label className="text-rds-text-muted mb-1 block">Y Pos</label>
              <input 
                type="number" step="0.01" 
                value={actor.y.toFixed(2)}
                onChange={(e) => updateActor(actor.id, { y: parseFloat(e.target.value) })}
                className="w-full bg-rds-header border border-rds-border rounded px-2 py-1 focus:border-rds-accent outline-none transition-colors"
                disabled={isLocked}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-rds-border">
            <div className="flex justify-between">
              <label className="text-rds-text-muted mb-1 block">Escala (Zoom)</label>
              <span className="text-rds-text-muted">{actor.zoom.toFixed(2)}x</span>
            </div>
            <input 
              type="range" min="0.1" max="3" step="0.05"
              value={actor.zoom}
              onChange={(e) => updateActor(actor.id, { zoom: parseFloat(e.target.value) })}
              className="w-full accent-rds-accent"
              disabled={isLocked}
            />
          </div>

          <div className="pt-2 border-t border-rds-border">
            <div className="flex justify-between">
              <label className="text-rds-text-muted mb-1 block">Rotación</label>
              <span className="text-rds-text-muted">{rot.toFixed(0)}°</span>
            </div>
            <input 
              type="range" min="-180" max="180" step="1"
              value={rot}
              onChange={(e) => updateActor(actor.id, { rotation: parseFloat(e.target.value) })}
              className="w-full accent-rds-accent"
              disabled={isLocked}
            />
          </div>

          <div className="pt-2 border-t border-rds-border">
            <div className="flex justify-between">
              <label className="text-rds-text-muted mb-1 block">Opacidad</label>
              <span className="text-rds-text-muted">{(alf * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={alf}
              onChange={(e) => updateActor(actor.id, { alpha: parseFloat(e.target.value) })}
              className="w-full accent-rds-accent"
              disabled={isLocked}
            />
          </div>

          <div className="pt-2 border-t border-rds-border flex gap-2">
            <button 
              onClick={() => updateActor(actor.id, { locked: !isLocked })}
              className={`flex-1 py-1.5 flex justify-center items-center gap-1 rounded border transition-colors ${isLocked ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-rds-header border-rds-border text-rds-text hover:border-rds-accent'}`}
            >
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
              {isLocked ? 'Bloqueado' : 'Bloquear'}
            </button>
          </div>
          
          <div className="pt-2 border-t border-rds-border grid grid-cols-2 gap-2">
            <button 
              onClick={() => updateActor(actor.id, { zIndex: (actor.zIndex ?? 10) + 1 })}
              className="py-1.5 flex justify-center items-center gap-1 bg-rds-header border border-rds-border text-rds-text hover:border-rds-accent rounded transition-colors"
            >
              <ArrowUpToLine size={14} /> Subir
            </button>
            <button 
              onClick={() => updateActor(actor.id, { zIndex: Math.max(0, (actor.zIndex ?? 10) - 1) })}
              className="py-1.5 flex justify-center items-center gap-1 bg-rds-header border border-rds-border text-rds-text hover:border-rds-accent rounded transition-colors"
            >
              <ArrowDownToLine size={14} /> Bajar
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
