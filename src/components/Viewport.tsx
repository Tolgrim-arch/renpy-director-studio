import { useStore } from '../store/useStore';
import { User, Image as ImageIcon } from 'lucide-react';

export default function Viewport() {
  const { actors, selectedActorId, selectActor } = useStore();

  return (
    <div className="flex-1 overflow-hidden flex items-center justify-center p-4 viewport-grid relative" onClick={() => selectActor(null)}>
      {/* 16:9 Aspect Ratio Container for Ren'Py Stage */}
      <div 
        className="relative bg-black shadow-2xl ring-1 ring-rds-border transition-all duration-75 overflow-hidden"
        style={{ width: '100%', maxWidth: '100%', maxHeight: '100%', aspectRatio: '16/9' }}
      >
        {/* Native 1080p scaled coordinate space */}
        <div 
          className="absolute inset-0 origin-top-left bg-[#111111]"
          style={{ width: 1920, height: 1080, transform: 'scale(1)', transformOrigin: 'top left' }}
        >
          {actors.map(actor => (
            <div
              key={actor.id}
              onClick={(e) => { e.stopPropagation(); selectActor(actor.id); }}
              className={`absolute flex flex-col items-center justify-center border-2 cursor-pointer transition-colors ${selectedActorId === actor.id ? 'border-rds-accent bg-rds-accent/20 z-50' : 'border-transparent hover:border-white/30'}`}
              style={{
                left: `${actor.x * 100}%`,
                top: `${actor.y * 100}%`,
                transform: `translate(-50%, -50%) scale(${actor.zoom})`,
                width: actor.type === 'background' ? 1920 : 400,
                height: actor.type === 'background' ? 1080 : 800,
                backgroundColor: actor.type === 'background' ? '#1a1a1a' : '#222',
              }}
            >
              {actor.type === 'character' ? <User size={64} className="text-white/50" /> : <ImageIcon size={64} className="text-white/20" />}
              <span className="text-white/50 text-xl font-mono mt-4">{actor.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
