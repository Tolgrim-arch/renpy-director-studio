import { Menu, Play, Settings, Layers } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';

export default function Header() {
  const { actors } = useStore();

  const handleExport = async () => {
    try {
      const filePath = await save({
        filters: [{ name: 'Ren\'Py Script', extensions: ['rpy'] }],
        defaultPath: 'scene.rpy'
      });
      
      if (filePath) {
        let script = "label scene_exported:\n";
        
        // Backgrounds first
        const backgrounds = actors.filter(a => a.type === 'background');
        backgrounds.forEach(bg => {
          const name = bg.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, '_');
          script += `    scene ${name}\n`;
        });
        
        // Characters/Items next
        const characters = actors.filter(a => a.type !== 'background');
        
        // Sort by Z-Index so Ren'Py draws them in order naturally, but also add zorder just in case
        characters.sort((a, b) => (a.zIndex ?? 10) - (b.zIndex ?? 10)).forEach(char => {
          const name = char.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, '_');
          const z = char.zIndex ?? 10;
          
          let transforms = `xalign ${char.x.toFixed(3)} yalign ${char.y.toFixed(3)} zoom ${char.zoom.toFixed(2)}`;
          if (char.rotation) transforms += ` rotate ${char.rotation}`;
          if (char.alpha !== undefined && char.alpha < 1.0) transforms += ` alpha ${char.alpha.toFixed(2)}`;
          
          script += `    show ${name} zorder ${z}:\n`;
          script += `        ${transforms}\n`;
        });
        
        script += "    return\n";
        
        await writeTextFile(filePath, script);
        
        const { message } = await import('@tauri-apps/plugin-dialog');
        await message('Script exportado con éxito!', { title: 'Éxito', kind: 'info' });
      }
    } catch (err: any) {
      console.error(err);
      const { message } = await import('@tauri-apps/plugin-dialog');
      await message(`Error al exportar: ${err.message || err}`, { title: 'Error', kind: 'error' });
    }
  };

  return (
    <header className="h-14 bg-rds-header border-b border-rds-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center space-x-6">
        <div className="flex flex-col justify-center">
          <div className="flex items-center text-rds-accent space-x-2">
            <Layers size={20} />
            <span className="font-bold text-sm tracking-wide leading-none">RDS SUITE</span>
          </div>
          <span className="text-[9px] text-rds-text-muted tracking-wider uppercase font-semibold mt-1">No programar, solo crear</span>
        </div>
        
        <nav className="flex space-x-4 text-xs font-medium text-rds-text-muted">
          <button className="hover:text-rds-text transition-colors">Archivo</button>
          <button className="hover:text-rds-text transition-colors">Edición</button>
          <button className="text-rds-text transition-colors">Escena</button>
          <button className="hover:text-rds-text transition-colors">UI & Pantallas</button>
          <button className="hover:text-rds-text transition-colors">Ayuda</button>
        </nav>
      </div>
      
      <div className="flex items-center space-x-3">
        <button 
          onClick={handleExport}
          className="bg-rds-accent hover:bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-semibold flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Play size={14} fill="currentColor" />
          <span>Exportar .rpy</span>
        </button>
      </div>
    </header>
  );
}
