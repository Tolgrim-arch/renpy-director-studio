import { FolderTree, Image as ImageIcon, User, Layers, FolderOpen } from 'lucide-react';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';
import { open } from '@tauri-apps/plugin-dialog';
import { convertFileSrc } from '@tauri-apps/api/core';

export default function Sidebar() {
  const { actors, selectedActorId, selectActor, assets, setAssets, setDraggedAsset, addActor } = useStore();

  const handleOpenFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });
      if (selected && typeof selected === 'string') {
        const { readDir } = await import('@tauri-apps/plugin-fs');
        const entries = await readDir(selected);
        const images = entries
          .filter(e => e.isFile && (
            e.name?.toLowerCase().endsWith('.png') || 
            e.name?.toLowerCase().endsWith('.webp') ||
            e.name?.toLowerCase().endsWith('.jpg') ||
            e.name?.toLowerCase().endsWith('.jpeg') ||
            e.name?.toLowerCase().endsWith('.jfif') ||
            e.name?.toLowerCase().endsWith('.gif') ||
            e.name?.toLowerCase().endsWith('.webm')
          ))
          .map(e => ({ name: e.name, path: `${selected}\\${e.name}` }));
        
        if (images.length === 0) {
          console.warn(`No se encontraron imágenes o videos en: ${selected}\nTotal archivos: ${entries.length}`);
        }
        
        setAssets(images);
      }
    } catch(err: any) {
      console.error(`Error al leer carpeta: ${err.message || err}`);
    }
  };

  const spawnAssetToStage = (asset: any) => {
    addActor({
      name: asset.name,
      type: 'character',
      x: 0.5,
      y: 0.5,
      zoom: 1.0,
      path: asset.path,
    });
  };

  return (
    <aside className="w-72 bg-rds-panel flex flex-col shrink-0 border-r border-rds-border">
      <div className="flex border-b border-rds-border bg-rds-header p-1 space-x-1 text-xs">
        <button className="flex-1 py-1.5 px-2 bg-rds-panel text-rds-accent rounded shadow-sm font-semibold">Capas de Escena</button>
        <button className="flex-1 py-1.5 px-2 text-rds-text-muted hover:text-rds-text rounded font-medium flex justify-center items-center gap-1" onClick={handleOpenFolder}>
          <FolderOpen size={14} /> Assets
        </button>
      </div>
      
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="text-[10px] font-semibold text-rds-text-muted mb-2 uppercase tracking-wider flex items-center justify-between">
          <span>Jerarquía</span>
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
              <span className="truncate flex-1">{actor.name}</span>
            </div>
          ))}
        </div>
        
        {assets.length > 0 && (
          <div className="mt-4">
            <div className="text-[10px] font-semibold text-rds-text-muted mb-2 uppercase tracking-wider flex items-center justify-between">
              <span>Directorio Local</span>
              <span>{assets.length}</span>
            </div>
            <div className="space-y-1">
              {assets.map(asset => {
                const isVideo = asset.name.toLowerCase().endsWith('.webm');
                const src = convertFileSrc(asset.path);
                return (
                  <div 
                    key={asset.path}
                    className="flex items-center space-x-2 p-1.5 rounded cursor-pointer border border-transparent hover:bg-rds-header text-rds-text-muted text-xs transition-colors"
                    onClick={() => spawnAssetToStage(asset)}
                    draggable
                    onDragStart={(e) => {
                      setDraggedAsset(asset);
                      e.dataTransfer.effectAllowed = 'copy';
                      e.dataTransfer.setData('text/plain', JSON.stringify(asset));
                    }}
                    onDragEnd={() => setDraggedAsset(null)}
                  >
                    {isVideo ? (
                      <video src={src} className="w-8 h-8 object-cover rounded bg-black pointer-events-none" muted />
                    ) : (
                      <img src={src} alt={asset.name} className="w-8 h-8 object-cover rounded bg-black pointer-events-none" />
                    )}
                    <span className="truncate flex-1 pointer-events-none">{asset.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
