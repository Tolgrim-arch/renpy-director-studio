import { useStore } from '../store/useStore';

export default function Inspector() {
  const { actors, selectedActorId, updateActor } = useStore();
  const selected = actors.find(a => a.id === selectedActorId);

  return (
    <aside className="w-80 bg-rds-panel border-l border-rds-border flex flex-col shrink-0 overflow-y-auto">
      <div className="p-3 border-b border-rds-border bg-rds-header">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-rds-text">Properties</h2>
        <span className="text-[10px] text-rds-accent mt-1 block font-mono">
          {selected ? selected.name : 'No actor selected'}
        </span>
      </div>
      
      {selected && (
        <div className="border-b border-rds-border">
          <div className="px-3 py-2 bg-rds-header flex items-center justify-between text-xs font-semibold">
            <span>Transform (ATL)</span>
          </div>
          <div className="p-3 space-y-3 bg-rds-panel">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-rds-text-muted block mb-1">X Pos (xalign)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={selected.x}
                  onChange={(e) => updateActor(selected.id, { x: parseFloat(e.target.value) })}
                  className="w-full bg-rds-header border border-rds-border rounded px-2 py-1 text-xs focus:outline-none focus:border-rds-accent font-mono" 
                />
              </div>
              <div>
                <label className="text-[10px] text-rds-text-muted block mb-1">Y Pos (yalign)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={selected.y}
                  onChange={(e) => updateActor(selected.id, { y: parseFloat(e.target.value) })}
                  className="w-full bg-rds-header border border-rds-border rounded px-2 py-1 text-xs focus:outline-none focus:border-rds-accent font-mono" 
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-rds-text-muted flex justify-between mb-1">
                <span>Zoom</span>
                <span className="font-mono">{selected.zoom.toFixed(2)}x</span>
              </label>
              <input 
                type="range" 
                min="0.1" max="3.0" step="0.05" 
                value={selected.zoom}
                onChange={(e) => updateActor(selected.id, { zoom: parseFloat(e.target.value) })}
                className="w-full accent-rds-accent" 
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
