import React, { useState, useMemo } from 'react';

const MAGNETIC = '#8b5cf6';
const ELECTRIC = '#2f7dee';

const coreFactor = { iron: 1.0, air: 0.05, wood: 0.02 };
const coreColor = { iron: '#6d7280', air: 'none', wood: '#8a5a34' };
const coreStroke = { iron: '#3a3f4d', air: '#5c6a82', wood: '#5c3d20' };
const coreDash = { iron: '0', air: '4 3', wood: '0' };
const MAX_CLIPS = 8;

export default function ElectromagnetLab() {
  const [on, setOn] = useState(false);
  const [turns, setTurns] = useState(40);
  const [volt, setVolt] = useState(2);
  const [core, setCore] = useState('iron');

  const strength = useMemo(() => {
    const raw = (turns / 100) * (volt / 4) * coreFactor[core];
    return Math.min(1, raw / coreFactor.iron);
  }, [turns, volt, core]);

  const attracted = on ? Math.round(strength * MAX_CLIPS) : 0;

  // Build coil loop positions
  const loopCount = Math.round(turns / 10);
  const loops = Array.from({ length: loopCount }, (_, i) => {
    const y = 8 + 124 * (i / Math.max(1, loopCount - 1));
    return y;
  });

  // Build clip positions
  const clips = Array.from({ length: MAX_CLIPS }, (_, i) => {
    const isAtt = i < attracted;
    const restX = 300 + (i % 4) * 14;
    const restY = 95 + Math.floor(i / 4) * 14;
    const targetX = 205;
    const targetY = 60 + i * 4;
    return { isAtt, x: isAtt ? targetX : restX, y: isAtt ? targetY : restY };
  });

  const obsText = !on
    ? "The switch is OFF, so the coil has no current in it — it's just a wire, not a magnet yet."
    : core !== 'iron'
      ? `Current is flowing, but ${core === 'air' ? "there's nothing" : 'wood'} inside the coil — it barely helps, so hardly any clips get picked up. Try putting the iron nail inside instead!`
      : `With an iron nail inside, ${turns} coil turns, and ${volt} cell(s), the coil becomes a real magnet and picks up ${attracted} of ${MAX_CLIPS} paper clips! More turns or more battery power = a stronger magnet. This is how big cranes lift heavy scrap metal.`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4 mt-4">
      {/* Stage */}
      <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-4 flex justify-between items-center">
          Electromagnet &amp; Crane
          <span className="text-xs font-semibold" style={{ color: MAGNETIC }}>● live</span>
        </h2>
        <div className="flex items-center justify-center min-h-[280px] rounded-xl overflow-hidden relative bg-[#f9f8ff]">
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-purple-600 opacity-[0.04] font-bold text-xl tracking-widest rotate-[-18deg] whitespace-nowrap">PRANJAL PATHSHALA</span>
          </span>
          <svg viewBox="0 0 400 300" className="w-full max-h-[360px] relative z-10">
            {/* Battery */}
            <g transform="translate(40,40)">
              <line x1="0" y1="0" x2="0" y2="30" stroke="#9db2cc" strokeWidth="3" />
              <line x1="-10" y1="10" x2="10" y2="10" stroke="#495a78" strokeWidth="3" />
              <line x1="-5" y1="20" x2="5" y2="20" stroke="#495a78" strokeWidth="6" />
              <text x="16" y="18" fill="#8fa0b8" fontSize="10" fontFamily="monospace">CELLS</text>
            </g>
            <path d="M40,40 L40,20 L90,20" stroke="#9db2cc" strokeWidth="3" fill="none" />
            {/* Switch */}
            <g transform="translate(110,20)">
              <circle cx="-20" cy="0" r="3" fill="#8fa0b8" />
              <circle cx="20" cy="0" r="3" fill="#8fa0b8" />
              <line x1="-20" y1="0" x2="20" y2="0" stroke="#ffc94d" strokeWidth="3"
                transform={on ? undefined : 'rotate(-22, -20, 0)'} style={{ transition: 'transform 0.3s' }} />
            </g>
            {/* Wire to coil */}
            <path d="M130,20 L170,20 L170,60" stroke={on ? ELECTRIC : '#9db2cc'} strokeWidth="3" fill="none"
              strokeDasharray={on ? '6 7' : 'none'}
              style={{ animation: on ? 'flow 0.9s linear infinite' : 'none' }} />
            {/* Core */}
            <rect x="188" y="70" width="26" height="140" rx="3"
              fill={coreColor[core]} stroke={coreStroke[core]} strokeWidth="1.5"
              strokeDasharray={coreDash[core]} />
            <text x="201" y="62" textAnchor="middle" fill="#dfe6ee" fontSize="12" fontFamily="monospace" fontWeight="700">N</text>
            <text x="201" y="228" textAnchor="middle" fill="#dfe6ee" fontSize="12" fontFamily="monospace" fontWeight="700">S</text>
            {/* Coil loops */}
            {loops.map((y, i) => (
              <ellipse key={i} cx="201" cy={70 + y} rx="22" ry="6"
                stroke="#ffc94d" strokeWidth={String(1.5 + strength * 3)} fill="none" />
            ))}
            {/* Wire from coil back */}
            <path d="M170,210 L170,250 L280,250" stroke={on ? ELECTRIC : '#9db2cc'} strokeWidth="3" fill="none"
              strokeDasharray={on ? '6 7' : 'none'}
              style={{ animation: on ? 'flow 0.9s linear infinite' : 'none' }} />
            <path d="M280,250 L280,200 L360,200 L360,60 L280,60 L280,20 L130,20"
              stroke="#9db2cc" strokeWidth="3" fill="none" />
            {/* Field lines */}
            {on && strength > 0.03 && (
              <g opacity={Math.min(0.95, 0.25 + strength * 0.9)}>
                <path d="M201,70 C 151,90 151,190 201,210" fill="none" stroke={MAGNETIC} strokeWidth="1.6"
                  style={{ animation: 'pulse 2.2s ease-in-out infinite' }} />
                <path d="M201,70 C 126,95 126,185 201,210" fill="none" stroke={MAGNETIC} strokeWidth="1.6"
                  style={{ animation: 'pulse 2.2s ease-in-out 0.3s infinite' }} />
                <path d="M201,70 C 251,90 251,190 201,210" fill="none" stroke={MAGNETIC} strokeWidth="1.6"
                  style={{ animation: 'pulse 2.2s ease-in-out 0.15s infinite' }} />
              </g>
            )}
            {/* Clip tray label */}
            <text x="307" y="120" textAnchor="middle" fill="#5c6a82" fontSize="9" fontFamily="monospace">CLIP TRAY</text>
            {/* Clips */}
            {clips.map((c, i) => (
              <g key={i} transform={`translate(${c.x},${c.y}) rotate(90)`} style={{ transition: 'transform 0.5s ease' }}>
                <path d="M0,0 C6,0 6,8 0,8 C-4,8 -4,3 0,3"
                  stroke={c.isAtt ? '#ffc94d' : '#9aa3ad'} strokeWidth="1.6" fill="none" />
              </g>
            ))}
          </svg>
          <style>{`
            @keyframes flow { to { stroke-dashoffset: -26; } }
            @keyframes pulse { 0%,100%{ opacity:.35; } 50%{ opacity:.9; } }
          `}</style>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4">
        <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Controls</h2>
          <button onClick={() => setOn(o => !o)}
            className={`w-full py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all mb-4 ${on ? 'text-white border-purple-500' : 'bg-slate-50 text-gray-700 border-slate-200 hover:border-purple-400'}`}
            style={on ? { background: MAGNETIC, borderColor: MAGNETIC } : {}}>
            🔌 Switch: {on ? 'ON' : 'OFF'}
          </button>
          <div className="mb-4">
            <label className="flex justify-between text-sm font-semibold text-gray-500 mb-2">
              <span>🌀 Coil wraps (turns)</span>
              <span className="font-bold" style={{ color: MAGNETIC }}>{turns}</span>
            </label>
            <input type="range" min="10" max="100" step="10" value={turns}
              onChange={e => setTurns(+e.target.value)} className="w-full accent-purple-500" />
          </div>
          <div className="mb-4">
            <label className="flex justify-between text-sm font-semibold text-gray-500 mb-2">
              <span>🔋 Battery power</span>
              <span className="font-bold" style={{ color: MAGNETIC }}>{volt} cell{volt > 1 ? 's' : ''}</span>
            </label>
            <input type="range" min="1" max="4" step="1" value={volt}
              onChange={e => setVolt(+e.target.value)} className="w-full accent-purple-500" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-500 mb-2 block">🧲 What's inside the coil?</label>
            <select value={core} onChange={e => setCore(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-400">
              <option value="iron">Iron Nail</option>
              <option value="air">Nothing (Air)</option>
              <option value="wood">Wood</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-3">What's happening</h2>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm">
            {[
              ['🧲 Magnet strength', Math.round(strength * 100) + '%'],
              ['📎 Clips picked up', `${attracted} / ${MAX_CLIPS}`],
              ['🪵 Core used', core === 'iron' ? 'Iron (best)' : core === 'air' ? 'Air (weak)' : 'Wood (weak)'],
            ].map(([label, val], i, arr) => (
              <div key={i} className={`flex justify-between py-2 ${i < arr.length - 1 ? 'border-b border-dashed border-slate-200' : ''}`}>
                <span className="text-gray-500 font-medium">{label}</span>
                <span className="font-bold" style={{ color: MAGNETIC }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-2">💡 In simple words</h2>
          <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-xl px-4 py-3 text-sm text-gray-800 leading-relaxed">
            {obsText}
          </div>
        </div>
      </div>
    </div>
  );
}