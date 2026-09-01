import React, { useState } from 'react';

const CHEM = '#1fb15c';

const potential = { zinc: -0.76, iron: -0.44, lead: -0.13, copper: 0.34, silver: 0.80 };
const metalColor = { zinc: '#c9cfd6', iron: '#6c6f73', lead: '#5b5f66', copper: '#c77b3c', silver: '#d8dde3' };
const metalSym = { zinc: 'Zn', iron: 'Fe', lead: 'Pb', copper: 'Cu', silver: 'Ag' };
const conductive = { lemon: true, salt: true, water: false };
const elyName = { lemon: 'LEMON JUICE', salt: 'SALT WATER', water: 'PURE DISTILLED WATER' };

const dryCellInfo = {
  zinc: { title: 'Zinc Container (−)', text: "This is the outer metal case. It is the negative end of the battery, and it slowly wears away as the battery is used." },
  carbon: { title: 'Carbon Rod (+)', text: "This rod sits in the middle with a metal cap on top — it's the positive end of the battery." },
  paste: { title: 'Moist Paste (in the middle)', text: "A damp paste sits between the zinc and the carbon rod. It lets electricity move between them, without being a runny liquid." },
};

function LemonCell() {
  const [e1, setE1] = useState('copper');
  const [e2, setE2] = useState('zinc');
  const [electrolyte, setElectrolyte] = useState('lemon');

  const voltage = e1 === e2 || !conductive[electrolyte] ? 0 : Math.abs(potential[e1] - potential[e2]);
  const lit = voltage > 0.25;
  const arrowCount = Math.min(4, Math.round(voltage * 3));

  const obsText = e1 === e2
    ? `Both strips are the same metal (${metalSym[e1]}). You need two different metals for this to work — right now, no electricity is made.`
    : !conductive[electrolyte]
      ? "Pure water can't carry current well. Even with two different metals, the LED stays off — try lemon juice or salt water instead."
      : `Great combo! ${metalSym[e1]} and ${metalSym[e2]} in ${elyName[electrolyte].toLowerCase()} make ${voltage.toFixed(2)} V of electricity.${lit ? " There's enough power to light up the LED!" : " Not quite enough yet to light the LED."}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4">
      {/* Stage */}
      <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-4 flex justify-between items-center">
          Voltaic Cell Rig
          <span className="text-xs font-semibold" style={{ color: CHEM }}>● live</span>
        </h2>
        <div className="flex items-center justify-center min-h-[280px] rounded-xl overflow-hidden relative bg-[#f6fdf9]">
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-green-600 opacity-[0.04] font-bold text-xl tracking-widest rotate-[-18deg] whitespace-nowrap">PRANJAL PATHSHALA</span>
          </span>
          <svg viewBox="0 0 400 300" className="w-full max-h-[360px] relative z-10">
            <defs>
              <marker id="arrowhead-g" markerWidth="6" markerHeight="6" refX="4" refY="2" orient="auto">
                <path d="M0,0 L4,2 L0,4 Z" fill="#7cf29c" />
              </marker>
            </defs>
            {/* Electrolyte container */}
            <ellipse cx="150" cy="190" rx="90" ry="60" fill="#1c2536" stroke="#2a344a" strokeWidth="2" />
            <ellipse cx="150" cy="190" rx="78" ry="48" fill="#101725" />
            <text x="150" y="255" textAnchor="middle" fill="#5c6a82" fontSize="10" fontFamily="monospace">{elyName[electrolyte]}</text>
            {/* Electrodes */}
            <rect x="115" y="150" width="10" height="90" rx="2" fill={metalColor[e1]} />
            <rect x="175" y="150" width="10" height="90" rx="2" fill={metalColor[e2]} />
            <text x="120" y="140" textAnchor="middle" fill="#8fa0b8" fontSize="9" fontFamily="monospace">{metalSym[e1]}</text>
            <text x="180" y="140" textAnchor="middle" fill="#8fa0b8" fontSize="9" fontFamily="monospace">{metalSym[e2]}</text>
            {/* Wires */}
            <path d="M120,150 L120,60 L260,60" stroke="#9db2cc" strokeWidth="3" fill="none" />
            <path d="M180,150 L180,90 L220,90" stroke="#9db2cc" strokeWidth="3" fill="none" />
            <path d="M220,90 L260,90 L260,60" stroke={lit ? CHEM : '#9db2cc'} strokeWidth="3" fill="none"
              strokeDasharray={lit ? '6 7' : 'none'}
              style={{ animation: lit ? 'flow 0.9s linear infinite' : 'none' }} />
            <path d="M260,60 L280,60 L280,75" stroke="#9db2cc" strokeWidth="3" fill="none" />
            <path d="M320,75 L340,75 L340,60 L120,60" stroke="#9db2cc" strokeWidth="3" fill="none" />
            {/* LED */}
            <circle cx="300" cy="75" r="20" fill={lit ? '#ffe066' : '#1c2536'} stroke="#2a344a" strokeWidth="2"
              style={{ filter: lit ? 'drop-shadow(0 0 8px #ffe066) drop-shadow(0 0 16px #ffe066)' : 'none', transition: 'all 0.3s' }} />
            <text x="300" y="79" textAnchor="middle" fill={lit ? '#7a5a00' : '#5c6a82'} fontSize="9" fontFamily="monospace">LED</text>
            {/* Ion flow arrows in electrolyte */}
            {voltage > 0 && [
              [[132, 175], [150, 175]], [[132, 195], [150, 195]], [[150, 175], [168, 175]], [[150, 195], [168, 195]]
            ].slice(0, arrowCount).map(([[x1, y1], [x2, y2]], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7cf29c" strokeWidth="2" markerEnd="url(#arrowhead-g)" />
            ))}
            <style>{`@keyframes flow { to { stroke-dashoffset: -26; } }`}</style>
          </svg>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4">
        <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Controls</h2>
          {[
            ['🔩 First metal strip', e1, setE1, 'va-e1'],
            ['🔩 Second metal strip', e2, setE2, 'va-e2'],
          ].map(([label, val, setter, id]) => (
            <div key={id} className="mb-4">
              <label className="text-sm font-semibold text-gray-500 mb-2 block">{label}</label>
              <select value={val} onChange={e => setter(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-green-400">
                {Object.keys(potential).map(m => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>
          ))}
          <div>
            <label className="text-sm font-semibold text-gray-500 mb-2 block">🧪 Liquid used</label>
            <select value={electrolyte} onChange={e => setElectrolyte(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-green-400">
              <option value="lemon">Lemon Juice</option>
              <option value="salt">Salt Water</option>
              <option value="water">Pure Distilled Water</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-3">What's happening</h2>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm">
            {[
              ['🔋 Voltage made', voltage.toFixed(2) + ' V'],
              ['💡 LED', lit ? 'ON' : 'OFF'],
              ['⚡ Electric field', voltage > 0 ? voltage.toFixed(2) + ' V/gap' : 'none'],
            ].map(([label, val], i, arr) => (
              <div key={i} className={`flex justify-between py-2 ${i < arr.length - 1 ? 'border-b border-dashed border-slate-200' : ''}`}>
                <span className="text-gray-500 font-medium">{label}</span>
                <span className="font-bold" style={{ color: CHEM }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-2">💡 In simple words</h2>
          <div className="bg-green-50 border-l-4 border-green-500 rounded-r-xl px-4 py-3 text-sm text-gray-800 leading-relaxed">
            {obsText}
          </div>
        </div>
      </div>
    </div>
  );
}

function DryCellCutaway() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4">
      <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-4">Dry Cell — Cutaway</h2>
        <div className="flex items-center justify-center min-h-[280px] rounded-xl overflow-hidden relative bg-[#f6fdf9]">
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-green-600 opacity-[0.04] font-bold text-xl tracking-widest rotate-[-18deg] whitespace-nowrap">PRANJAL PATHSHALA</span>
          </span>
          <svg viewBox="0 0 400 300" className="w-full max-h-[360px] relative z-10">
            <style>{`
              @keyframes hs-pulse { 0%,100%{ r:6; } 50%{ r:8; } }
              .hotspot-circle { animation: hs-pulse 2s ease-in-out infinite; cursor: pointer; }
            `}</style>
            {/* Battery body */}
            <rect x="130" y="30" width="140" height="230" rx="14" fill="#3a3f4d" stroke="#5c6a82" strokeWidth="2" />
            <rect x="142" y="42" width="116" height="196" rx="8" fill="#161b22" />
            <rect x="150" y="50" width="100" height="180" rx="6" fill="#22160f" />
            {/* Cap (+) */}
            <rect x="185" y="20" width="30" height="26" rx="3" fill="#c9a24a" stroke="#8a7433" />
            {/* Carbon rod */}
            <rect x="190" y="46" width="20" height="184" fill="#2b2b2b" />
            {/* +/- labels */}
            <text x="200" y="15" textAnchor="middle" fill="#7cf29c" fontSize="12" fontFamily="monospace" fontWeight="700">+</text>
            <text x="200" y="278" textAnchor="middle" fill="#ff8a80" fontSize="12" fontFamily="monospace" fontWeight="700">−</text>
            {/* Legend lines */}
            <line x1="142" y1="150" x2="85" y2="153" stroke="#5c6a82" strokeWidth="1" strokeDasharray="3 2" />
            <text x="80" y="157" textAnchor="end" fill="#5c6a82" fontSize="9" fontFamily="monospace">zinc container</text>
            <line x1="210" y1="140" x2="265" y2="143" stroke="#5c6a82" strokeWidth="1" strokeDasharray="3 2" />
            <text x="268" y="147" textAnchor="start" fill="#5c6a82" fontSize="9" fontFamily="monospace">carbon rod</text>
            <line x1="150" y1="200" x2="85" y2="203" stroke="#5c6a82" strokeWidth="1" strokeDasharray="3 2" />
            <text x="80" y="207" textAnchor="end" fill="#5c6a82" fontSize="9" fontFamily="monospace">moist paste</text>
            {/* Hotspots */}
            {[
              { id: 'zinc', cx: 140, cy: 150 },
              { id: 'carbon', cx: 200, cy: 140 },
              { id: 'paste', cx: 170, cy: 200 },
            ].map(({ id, cx, cy }) => (
              <g key={id} onClick={() => setSelected(id)} style={{ cursor: 'pointer' }}>
                <circle className="hotspot-circle" cx={cx} cy={cy} r="6"
                  fill={selected === id ? '#7cf29c' : CHEM} stroke="#fff" strokeWidth="2" />
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Tap a Part</h2>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-gray-800 leading-relaxed min-h-[80px]">
            {selected ? (
              <>
                <span className="text-green-600 font-bold text-xs uppercase tracking-wide block mb-1">{dryCellInfo[selected].title}</span>
                {dryCellInfo[selected].text}
              </>
            ) : (
              <span className="text-gray-400">👆 Tap a glowing dot to learn what that part does.</span>
            )}
          </div>
        </div>

        <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-3">🔋 Dry Cell vs Lithium-ion</h2>
          <ul className="text-sm text-gray-500 space-y-2 pl-4 list-disc">
            <li><span className="font-bold text-gray-700">Dry cell</span> — used once, then thrown away (like a torch battery).</li>
            <li><span className="font-bold text-gray-700">Lithium-ion</span> — charged again and again, used in phones and laptops.</li>
            <li><span className="font-bold text-gray-700">Don't just bin them!</span> — old batteries should go to a collection point so their metals can be reused safely.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function VoltaicLab() {
  const [mode, setMode] = useState('a');

  return (
    <div className="mt-4">
      {/* Subtabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {[['a', '🍋 Lemon Battery'], ['b', '🔋 Inside a Dry Cell']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`text-sm font-bold px-4 py-2.5 rounded-xl border-2 whitespace-nowrap transition-all ${mode === m ? 'text-white border-green-500' : 'bg-white text-gray-500 border-slate-200 hover:border-green-400'}`}
            style={mode === m ? { background: CHEM, borderColor: CHEM } : {}}>
            {label}
          </button>
        ))}
      </div>
      {mode === 'a' ? <LemonCell /> : <DryCellCutaway />}
    </div>
  );
}