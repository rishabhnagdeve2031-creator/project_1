import React, { useState } from 'react';
import { Eye, Activity } from 'lucide-react';

const WildlifeMap = () => {
  const [activeMarker, setActiveMarker] = useState(null);

  const trackingNodes = [
    { id: 'cam-01', x: 280, y: 150, title: 'Bio-Cam #08 (Core Zone)', status: 'ACTIVE', desc: 'Bengal Tiger (Adult Female) logged 4 mins ago. Moving Southeast.' },
    { id: 'cam-02', x: 520, y: 220, title: 'Hydro-Sensor #03', status: 'STABLE', desc: 'Pench River tributary level: 1.4m. Increased herbivore traffic.' },
    { id: 'cam-03', x: 380, y: 380, title: 'Corridor Cam #12', status: 'ACTIVE', desc: 'Dhole pack detected crossing corridor. Heading toward buffer.' },
    { id: 'cam-04', x: 190, y: 290, title: 'Acoustic Node #02', status: 'MONITORING', desc: 'Langur alarm calls registered. Possible carnivore activity nearby.' },
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[500px] glass-panel-cyan rounded-2xl overflow-hidden scanlines p-6 flex flex-col justify-between">
      {/* Grid overlay for tech look */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

      {/* Map Header */}
      <div className="relative z-10 flex justify-between items-start border-b border-cyan-500/20 pb-3">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-cyan-400 font-bold uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Telemetry System Active
          </span>
          <h3 className="text-xl font-serif text-stone-100 tracking-wide mt-1">PENCH TIGER RESERVE</h3>
          <p className="text-[10px] text-stone-400 font-mono">GRID: 21°42'N / 79°15'E | BUFFER-CORE DEV</p>
        </div>
        <div className="text-right font-mono text-[10px] text-cyan-400 bg-cyan-950/40 px-3 py-1.5 rounded border border-cyan-500/30">
          <div>PATROL UNIT: MP-04</div>
          <div className="mt-0.5 text-stone-300">RSSI: -64dBm</div>
        </div>
      </div>

      {/* SVG Vector Map Canvas */}
      <div className="relative flex-grow my-4 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 800 450"
          className="w-full h-full text-cyan-500/40 select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Topographic organic curves */}
          <path d="M 50,80 Q 200,40 380,90 T 700,60" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" className="opacity-30" />
          <path d="M 80,140 Q 250,90 440,150 T 750,110" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-25" />
          <path d="M 30,220 Q 220,180 400,240 T 780,200" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40" />
          <path d="M 60,320 Q 280,260 480,310 T 730,290" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-20" />
          <path d="M 100,390 Q 300,340 500,400 T 790,370" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" className="opacity-30" />

          {/* Pench River (Water Source) - Glowing cyan stroke */}
          <path
            d="M 120,450 C 180,380 240,320 290,260 C 330,210 320,150 350,90 C 370,50 430,30 460,0"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="3.5"
            className="opacity-70 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
          />
          {/* River branch */}
          <path
            d="M 290,260 C 350,280 430,310 490,280 C 560,250 630,190 710,170"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            className="opacity-50 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]"
          />

          {/* Wildlife Corridor - Highlighted zone */}
          <path
            d="M 250,50 Q 500,100 550,280 T 600,420"
            fill="none"
            stroke="#4ade80"
            strokeWidth="12"
            strokeLinecap="round"
            className="opacity-15"
          />
          <path
            d="M 250,50 Q 500,100 550,280 T 600,420"
            fill="none"
            stroke="#4ade80"
            strokeWidth="1"
            strokeDasharray="5 5"
            className="opacity-40"
          />

          {/* Tiger Movement Route - Animated glowing path */}
          <path
            id="tiger-path"
            d="M 150,350 Q 230,280 340,300 T 560,180 T 700,240"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="8 8"
            className="opacity-80 drop-shadow-[0_0_6px_rgba(245,158,11,0.9)]"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="100;0"
              dur="12s"
              repeatCount="indefinite"
            />
          </path>

          {/* Sensors & Active Nodes */}
          {trackingNodes.map((node) => (
            <g
              key={node.id}
              className="cursor-pointer group"
              onClick={() => setActiveMarker(activeMarker?.id === node.id ? null : node)}
              onMouseEnter={() => setActiveMarker(node)}
            >
              {/* Outer pulsing ring */}
              <circle
                cx={node.x}
                cy={node.y}
                r="10"
                fill="transparent"
                stroke={node.id === 'cam-01' ? '#f59e0b' : '#22d3ee'}
                strokeWidth="1.5"
                className="animate-ping origin-center"
                style={{ animationDuration: '2.5s' }}
              />
              {/* Node base */}
              <circle
                cx={node.x}
                cy={node.y}
                r="5"
                fill={node.id === 'cam-01' ? '#f59e0b' : '#22d3ee'}
                className="transition-transform group-hover:scale-125"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r="2"
                fill="#ffffff"
              />
            </g>
          ))}

          {/* Labels on Map */}
          <text x="360" y="70" fill="#a5f3fc" fontSize="9" fontFamily="monospace" letterSpacing="2" className="opacity-70">WATER POINT ALPHA</text>
          <text x="510" y="320" fill="#a7f3d0" fontSize="9" fontFamily="monospace" letterSpacing="2" className="opacity-70">EASTERN CORRIDOR</text>
          <text x="140" y="370" fill="#fef08a" fontSize="9" fontFamily="monospace" letterSpacing="2" className="opacity-80">ACTIVE TRACKING VECTOR</text>
        </svg>

        {/* Dynamic Telemetry Tooltip Panel */}
        {activeMarker && (
          <div className="absolute bottom-4 left-4 right-4 glass-panel border-cyan-500/30 p-3 rounded-lg flex items-start gap-3 transition-all duration-300 animate-fadeIn">
            <div className={`p-2 rounded ${activeMarker.id === 'cam-01' ? 'bg-amber-950/50 text-amber-400 border border-amber-500/30' : 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/30'}`}>
              {activeMarker.id === 'cam-01' ? <Activity className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-mono text-xs font-bold text-stone-100">{activeMarker.title}</h4>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${activeMarker.status === 'ACTIVE' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 animate-pulse' : 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'}`}>
                  {activeMarker.status}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">{activeMarker.desc}</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div className="relative z-10 grid grid-cols-4 gap-2 border-t border-cyan-500/10 pt-3 text-[10px] text-stone-400 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1 bg-amber-500 block rounded-full" />
          <span>Tiger Vectors</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1.5 bg-cyan-400 block rounded-full" />
          <span>Water Sources</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1.5 bg-green-500/60 block rounded-full" />
          <span>Migratory Corridors</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-cyan-400 inline-block rounded-full animate-pulse" />
          <span>Sensor Stations</span>
        </div>
      </div>
    </div>
  );
};

export default WildlifeMap;
