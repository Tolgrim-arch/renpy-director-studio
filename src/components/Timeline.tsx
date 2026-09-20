import { Play, SkipBack, SkipForward } from 'lucide-react';

export default function Timeline() {
  return (
    <div className="h-32 bg-rds-panel border-t border-rds-border flex flex-col shrink-0">
      <div className="h-8 bg-rds-header px-3 flex items-center space-x-4 border-b border-rds-border">
        <div className="flex items-center space-x-1">
          <button className="p-1 hover:bg-rds-panel rounded text-rds-text"><SkipBack size={14} /></button>
          <button className="p-1 hover:bg-rds-panel rounded text-rds-text"><Play size={14} /></button>
          <button className="p-1 hover:bg-rds-panel rounded text-rds-text"><SkipForward size={14} /></button>
        </div>
        <div className="text-xs font-mono text-rds-text-muted">
          0.00s / 2.00s
        </div>
      </div>
      <div className="flex-1 p-2 relative">
        {/* Scrubber Area */}
        <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-rds-accent z-10 pointer-events-none"></div>
        <div className="w-full h-full bg-rds-header border border-rds-border rounded opacity-50"></div>
      </div>
    </div>
  );
}
