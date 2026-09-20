import { FolderTree, Image as ImageIcon, User, Layers, FolderOpen } from 'lucide-react';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';
import { open } from '@tauri-apps/plugin-dialog';

export default function Sidebar() {
  const { actors, selectedActorId, selectActor } = useStore();

  const handleOpenFolder = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (selected) {
      console.log('Carpeta seleccionada:', selected);
      // Aquí conectaremos la lectura de archivos .png
    }
  };

  return (
    <aside className="w-72 bg-rds-panel flex flex-col shrink-0 border-r border-rds-border">
      <div className="flex border-b border-rds-border bg-rds-header p-1 space-x-1 text-xs">
        <button className="flex-1 py-1.5 px-2 bg-rds-panel text-rds-accent rounded shadow-sm font-semibold">Scene Layers</button>
        <button className="flex-1 py-1.5 px-2 text-rds-text-muted hover:text-rds-text rounded font-medium flex justify-center items-center gap-1" onClick={handleOpenFolder}>
          <FolderOpen size={14} /> Assets
        </button>
      </div>
      
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="text-[10px] font-semibold text-rds-text-muted mb-2 uppercase tracking-wider flex items-center justify-between">
          <span>Hierarchy</span>
          <span>{actors.length}</span>
        </div>
        
        <div className="space-y-1">
          {actors.map(actor => (
            <div 
              key={actor.id}
              onClick={() => selectActor(actor.id)}
              className={clsx(
                "flex items-center space-x-2 p-1.5 rounded cursor-pointer border text-xs transition-colors",
                selectedActorId === actor.id 
                  ? "bg-rds-header border-rds-accent/50 text-white" 
                  : "border-transparent hover:bg-rds-header text-rds-text-muted"
              )}
            >
              {actor.type === 'character' ? <User size={14} className={selectedActorId === actor.id ? 'text-rds-accent' : ''} /> : <ImageIcon size={14} className={selectedActorId === actor.id ? 'text-rds-accent' : ''} />}
              <span>{actor.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
