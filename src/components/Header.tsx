import { Menu, Play, Settings, Layers } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-10 bg-rds-header border-b border-rds-border flex items-center justify-between px-3 shrink-0">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-rds-accent font-semibold tracking-wider">
          <Layers size={16} />
          <span>RDS SUITE</span>
        </div>
        
        <nav className="flex space-x-1">
          {['File', 'Edit', 'Scene', 'UI & Screens', 'Help'].map(item => (
            <button key={item} className="px-3 py-1 hover:bg-rds-panel rounded text-xs text-rds-text">
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center space-x-2">
        <button className="flex items-center space-x-1 px-3 py-1 bg-rds-accent text-white rounded hover:bg-blue-600 text-xs font-medium">
          <Play size={14} fill="currentColor" />
          <span>Export .rpy</span>
        </button>
      </div>
    </header>
  );
}
