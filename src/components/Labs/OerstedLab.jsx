import React, { useState, useEffect, useRef } from 'react';

const ELECTRIC = '#2f7dee';
const MAGNETIC = '#8b5cf6';

export default function OerstedLab() {
  const [on, setOn] = useState(false);
  const [polarity, setPolarity] = useState(1);
  const [dist, setDist] = useState(5);

  const maxDeflect = 68;
  const proximity = 1 - (dist - 1) / 9;
  const deflection = on ? Math.round(maxDeflect * proximity) : 0;
  const angle = polarity * deflection;

  const obsText = !on
    ? 'The switch is OFF, so no current flows. The compass just points North, like normal.'
    : `Turn the switch ON and current starts flowing through the wire. This current creates its own tiny magnetic field around the wire, and the compass needle feels it and turns! Right now it has turned ${deflection}° to the ${polarity > 0 ? 'right' : 'left'}${dist <= 3 ? ' — a big turn, because the compass is very close to the wire.' : dist >= 8 ? ' — only a small turn, because the compass is far away. The magnetic effect gets weaker with distance.' : '.'}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4 mt-4">
      {/* Stage */}
      <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-4 flex justify-between items-center">
          Circuit &amp; Compass
          <span className="text-xs font-semibold" style={{ color: ELECTRIC }}>● live</span>
        </h2>
        <div className="flex items-center justify-center min-h-[280px] rounded-xl overflow-hidden relative bg-[#f8fbff]">
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-blue-600 opacity-[0.04] font-bold text-xl tracking-widest rotate-[-18deg] whitespace-nowrap">PRANJAL PATHSHALA</span>
          </span>
          <svg viewBox="0 0 400 300" className="w-full max-h-[360px] relative z-10">
            {/* Battery */}
            <g transform="translate(40,60)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="#9db2cc" strokeWidth="3" />
              <line x1="-10" y1="14" x2="10" y2="14" stroke="#495a78" strokeWidth="3" />
              <line x1="-5" y1="26" x2="5" y2="26" stroke="#495a78" strokeWidth="6" />
              <text x="18" y="24" fill="#8fa0b8" fontSize="10" fontFamily="monospace">CELL</text>
            </g>
            {/* Outer loop */}
            <path d="M40,60 L40,20 L120,20" stroke="#9db2cc" strokeWidth="3" fill="none" />
            <path d="M120,20 L200,20 L280,20" stroke={on ? ELECTRIC : '#9db2cc'} strokeWidth="3" fill="none"
              strokeDasharray={on ? '6 7' : 'none'}
              style={{ animation: on ? 'flow 0.9s linear infinite' : 'none' }} />
            <path d="M280,20 L360,20 L360,100" stroke="#9db2cc" strokeWidth="3" fill="none" />
            {/* Switch */}
            <g transform="translate(150,20)">
              <circle cx="-30" cy="0" r="3" fill="#8fa0b8" />
              <circle cx="30" cy="0" r="3" fill="#8fa0b8" />
              <line x1="-30" y1="0" x2="30" y2="0" stroke="#ffc94d" strokeWidth="3"
                transform={on ? undefined : 'rotate(-22, -30, 0)'} style={{ transition: 'transform 0.3s' }} />
            </g>
            {/* Wire over compass */}
            <path d="M360,100 L360,210 L260,210" stroke="#9db2cc" strokeWidth="3" fill="none" />
            <path d="M260,210 L140,210" stroke={on ? ELECTRIC : '#9db2cc'} strokeWidth="3" fill="none"
              strokeDasharray={on ? '6 7' : 'none'}
              style={{ animation: on ? `flow${polarity < 0 ? '-rev' : ''} 0.9s linear infinite` : 'none' }} />
            <path d="M140,210 L40,210 L40,100" stroke="#9db2cc" strokeWidth="3" fill="none" />
            {/* Current label */}
            <text x="200" y="235" textAnchor="middle" fill="#5ee1ff" fontSize="11" fontFamily="monospace">
              {on ? (polarity > 0 ? '→ current is flowing this way →' : '← current is flowing this way ←') : '— current is OFF —'}
            </text>
            {/* Field lines */}
            {on && [30, 55, 80].map((rx, i) => (
              <ellipse key={i} cx="200" cy="210" rx={rx} ry={rx * 0.4} fill="none"
                stroke={MAGNETIC} strokeWidth="1.6" opacity="0.85"
                style={{ animation: `pulse 2.2s ease-in-out ${i * 0.3}s infinite` }} />
            ))}
            {/* Compass */}
            <g transform="translate(200,210)">
              <circle r="42" fill="#0c111c" stroke="#2a344a" strokeWidth="2" />
              {[['N', 0, -30], ['S', 0, 38], ['W', -34, 4], ['E', 34, 4]].map(([l, x, y]) => (
                <text key={l} x={x} y={y} textAnchor="middle" fill="#5c6a82" fontSize="10" fontFamily="monospace">{l}</text>
              ))}
              <g style={{ transformOrigin: '0px 0px', transform: `rotate(${angle}deg)`, transition: 'transform 0.6s cubic-bezier(.34,1.4,.64,1)' }}>
                <polygon points="0,-30 4,0 0,4 -4,0" fill="#ff5252" />
                <polygon points="0,30 4,0 0,-4 -4,0" fill="#dfe6ee" />
                <circle r="4" fill="#8fa0b8" />
              </g>
            </g>
          </svg>
        </div>
        <style>{`
          @keyframes flow { to { stroke-dashoffset: -26; } }
          @keyframes flow-rev { to { stroke-dashoffset: 26; } }
          @keyframes pulse { 0%,100%{ opacity:.35; } 50%{ opacity:.9; } }
        `}</style>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4">
        {/* Controls */}
        <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Controls</h2>
          <div className="flex gap-3 flex-wrap mb-4">
            <button onClick={() => setOn(o => !o)}
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${on ? 'bg-blue-500 text-white border-blue-500' : 'bg-slate-50 text-gray-700 border-slate-200 hover:border-blue-400'}`}>
              🔌 Switch: {on ? 'ON' : 'OFF'}
            </button>
            <button onClick={() => setPolarity(p => -p)}
              className="flex-1 min-w-[120px] py-3 px-4 rounded-xl text-sm font-bold border-2 border-slate-200 bg-slate-50 text-gray-700 hover:border-blue-400 transition-all">
              🔁 Flip Battery
            </button>
          </div>
          <div>
            <label className="flex justify-between text-sm font-semibold text-gray-500 mb-2">
              <span>📏 How close is the compass?</span>
              <span className="text-blue-500 font-bold">{dist}</span>
            </label>
            <input type="range" min="1" max="10" value={dist} onChange={e => setDist(+e.target.value)}
              className="w-full accent-blue-500" />
          </div>
        </div>

        {/* Readout */}
        <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-3">What's happening</h2>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm space-y-0">
            {[
              ['⚡ Current', on ? 'Flowing' : 'Not flowing', ELECTRIC],
              ['🔋 Direction', polarity > 0 ? 'Normal' : 'Flipped', ELECTRIC],
              [`🧭 Needle turned by`, `${deflection}°${on ? (polarity > 0 ? ' (right)' : ' (left)') : ''}`, ELECTRIC],
            ].map(([label, val, color], i, arr) => (
              <div key={i} className={`flex justify-between py-2 ${i < arr.length - 1 ? 'border-b border-dashed border-slate-200' : ''}`}>
                <span className="text-gray-500 font-medium">{label}</span>
                <span className="font-bold" style={{ color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Observation */}
        <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-2">💡 In simple words</h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl px-4 py-3 text-sm text-gray-800 leading-relaxed">
            {obsText}
          </div>
        </div>
      </div>
    </div>
  );
}