import React, { useState, useEffect, useRef, useCallback } from 'react';

const HEAT = '#ff7a3d';
const AMBER = '#ffb020';

const relResistivity = { nichrome: 1.0, aluminium: 0.32, copper: 0.15 };
const thicknessFactor = { thin: 1.6, thick: 0.55 };

function hexToRgb(h) {
  h = h.replace('#', '');
  return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
}
function lerpColor(a, b, f) {
  const pa = hexToRgb(a), pb = hexToRgb(b);
  return `rgb(${Math.round(pa[0] + (pb[0] - pa[0]) * f)},${Math.round(pa[1] + (pb[1] - pa[1]) * f)},${Math.round(pa[2] + (pb[2] - pa[2]) * f)})`;
}
function tempToColor(t) {
  if (t < 90) return '#9aa3ad';
  if (t < 300) return lerpColor('#9aa3ad', '#ff9d3d', (t - 90) / 210);
  return lerpColor('#ff9d3d', '#ff3b30', Math.min(1, (t - 300) / 500));
}
function levelWord(v, [lo, hi]) {
  if (v < lo) return 'Low';
  if (v < hi) return 'Medium';
  return 'High';
}

export default function HeatingLab() {
  const [material, setMaterial] = useState('nichrome');
  const [thickness, setThickness] = useState('thin');
  const [volt, setVolt] = useState(2);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [showField, setShowField] = useState(false);
  const timerRef = useRef(null);

  const resistance = () => relResistivity[material] * thicknessFactor[thickness];
  const voltage = () => volt * 1.5;
  const current = () => voltage() / (resistance() * 4);
  const power = () => current() * current() * resistance() * 4;

  const tempFromEnergy = () => {
    const k = material === 'nichrome' ? 55 : material === 'aluminium' ? 18 : 8;
    const maxT = material === 'nichrome' ? 950 : material === 'aluminium' ? 260 : 140;
    return Math.min(25 + k * power() * (elapsed / 10), maxT);
  };

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setElapsed(e => {
          if (e >= 60) { setRunning(false); clearInterval(timerRef.current); return e; }
          return e + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  const reset = () => { setRunning(false); setElapsed(0); };

  const t = tempFromEnergy();
  const fillPct = Math.max(6, Math.min(100, ((t - 25) / (950 - 25)) * 100));
  const wireColor = tempToColor(t);
  const glowing = t > 350;
  const cur = current(), pow = power(), res = resistance();
  const showArrows = showField && running;
  const arrowCount = Math.min(4, Math.max(1, Math.round(cur * 2)));

  const obsText = elapsed === 0 && !running
    ? `Press Start to send current through the ${material} wire and watch it heat up.`
    : t > 500
      ? `${material} is glowing red-hot! It blocks current so much that most of the electrical energy turns into heat.`
      : t > 90
        ? `The wire is warming up. The ${thickness} ${material} wire is turning electrical energy into heat as current pushes through it.`
        : `Barely any warming yet — ${material} lets current pass ${material === 'copper' ? 'very easily' : 'fairly easily'}, so not much heat is made.`;

  const matLabel = `${material.toUpperCase()} · ${thickness.toUpperCase()} · ${voltage().toFixed(1)}V`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4 mt-4">
      {/* Stage */}
      <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-4 flex justify-between items-center">
          Heating Effect
          <span className="text-xs font-semibold" style={{ color: HEAT }}>● live</span>
        </h2>
        <div className="flex items-center justify-center min-h-[280px] rounded-xl overflow-hidden relative bg-[#fff9f6]">
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-orange-500 opacity-[0.04] font-bold text-xl tracking-widest rotate-[-18deg] whitespace-nowrap">PRANJAL PATHSHALA</span>
          </span>
          <svg viewBox="0 0 400 300" className="w-full max-h-[360px] relative z-10">
            <defs>
              <marker id="arrowhead-he" markerWidth="6" markerHeight="6" refX="4" refY="2" orient="auto">
                <path d="M0,0 L4,2 L0,4 Z" fill="#5ee1ff" />
              </marker>
              {glowing && (
                <filter id="glow-hot">
                  <feGaussianBlur stdDeviation="3" result="blur1" />
                  <feGaussianBlur stdDeviation="7" result="blur2" />
                  <feMerge><feMergeNode in="blur1" /><feMergeNode in="blur2" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              )}
            </defs>
            {/* Battery */}
            <g transform="translate(40,220)">
              <line x1="0" y1="0" x2="0" y2="30" stroke="#9db2cc" strokeWidth="3" />
              <line x1="-10" y1="10" x2="10" y2="10" stroke="#495a78" strokeWidth="3" />
              <line x1="-5" y1="20" x2="5" y2="20" stroke="#495a78" strokeWidth="6" />
              <text x="14" y="18" fill="#8fa0b8" fontSize="10" fontFamily="monospace">PACK</text>
            </g>
            <path d="M40,220 L40,250 L90,250" stroke="#9db2cc" strokeWidth="3" fill="none" />
            {/* Switch */}
            <g transform="translate(110,250)">
              <circle cx="-20" cy="0" r="3" fill="#8fa0b8" />
              <circle cx="20" cy="0" r="3" fill="#8fa0b8" />
              <line x1="-20" y1="0" x2="20" y2="0" stroke="#ffc94d" strokeWidth="3"
                transform={running ? undefined : 'rotate(-22, -20, 0)'} style={{ transition: 'transform 0.3s' }} />
            </g>
            <path d="M130,250 L200,250 L200,220" stroke={running ? '#2f7dee' : '#9db2cc'} strokeWidth="3" fill="none"
              strokeDasharray={running ? '6 7' : 'none'}
              style={{ animation: running ? 'flow 0.9s linear infinite' : 'none' }} />
            <path d="M40,220 L40,110 L90,110" stroke="#9db2cc" strokeWidth="3" fill="none" />
            <path d="M200,220 L200,180" stroke={running ? '#2f7dee' : '#9db2cc'} strokeWidth="3" fill="none"
              strokeDasharray={running ? '6 7' : 'none'}
              style={{ animation: running ? 'flow 0.9s linear infinite' : 'none' }} />
            {/* Terminals */}
            <rect x="82" y="95" width="14" height="30" rx="2" fill="#3a3f4d" stroke="#5c6a82" />
            <rect x="184" y="95" width="14" height="30" rx="2" fill="#3a3f4d" stroke="#5c6a82" />
            {/* Test wire */}
            <path d="M96,108 Q145,150 190,108" stroke={wireColor} strokeWidth="5" fill="none" strokeLinecap="round"
              filter={glowing ? 'url(#glow-hot)' : 'none'} style={{ transition: 'stroke 0.4s' }} />
            <path d="M186,110 L200,110 L200,180" stroke="#9db2cc" strokeWidth="3" fill="none" />
            <path d="M96,108 L40,108" stroke="#9db2cc" strokeWidth="3" fill="none" />
            {/* Field arrows */}
            {showArrows && [
              [[105, 128], [122, 120]], [[128, 140], [145, 133]], [[151, 140], [168, 133]], [[174, 128], [185, 118]]
            ].slice(0, arrowCount).map(([[x1, y1], [x2, y2]], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5ee1ff" strokeWidth="2"
                markerEnd="url(#arrowhead-he)" />
            ))}
            <text x="200" y="270" textAnchor="middle" fill="#5c6a82" fontSize="10" fontFamily="monospace">{matLabel}</text>
          </svg>
          <style>{`@keyframes flow { to { stroke-dashoffset: -26; } }`}</style>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4">
        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Controls</h2>
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-500 mb-2 block">🧵 Wire material</label>
            <select value={material} onChange={e => { setMaterial(e.target.value); reset(); }}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-orange-400">
              <option value="nichrome">Nichrome (blocks current a lot)</option>
              <option value="aluminium">Aluminium (blocks a little)</option>
              <option value="copper">Copper (blocks very little)</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-500 mb-2 block">📏 How thick is the wire?</label>
            <select value={thickness} onChange={e => { setThickness(e.target.value); reset(); }}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-orange-400">
              <option value="thin">Thin</option>
              <option value="thick">Thick</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-500 mb-2 block">🔋 Power source</label>
            <select value={volt} onChange={e => { setVolt(+e.target.value); reset(); }}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-orange-400">
              <option value="1">1 cell (low power)</option>
              <option value="2">2 cells (medium power)</option>
              <option value="4">4 cells (high power)</option>
            </select>
          </div>
          <div className="flex gap-3 mb-4">
            <button onClick={() => setRunning(r => !r)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${running ? 'text-white border-orange-500' : 'bg-slate-50 text-gray-700 border-slate-200 hover:border-orange-400'}`}
              style={running ? { background: HEAT, borderColor: HEAT } : {}}>
              {running ? '❚❚ Pause' : '▶ Start'}
            </button>
            <button onClick={reset}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-bold border-2 border-slate-200 bg-slate-50 text-gray-700 hover:border-orange-400 transition-all">
              ↺ Reset
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showField} onChange={e => setShowField(e.target.checked)}
              className="w-4 h-4 accent-orange-500" />
            ⚡ Show electric field arrows
          </label>
        </div>

        {/* Thermometer */}
        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-3 flex justify-between">
            Thermometer
            <span className="text-xs font-semibold" style={{ color: HEAT }}>{elapsed}s / 60s</span>
          </h2>
          <div className="flex items-end gap-4">
            <div className="w-6 h-36 border-2 border-slate-200 rounded-xl relative overflow-hidden bg-slate-50">
              <div className="absolute bottom-0 left-0 right-0 rounded-b-xl transition-all duration-400"
                style={{ height: fillPct + '%', background: `linear-gradient(180deg, ${HEAT}, ${AMBER})` }} />
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: HEAT, fontFamily: 'monospace' }}>{Math.round(t)}°C</div>
              <div className="text-xs text-gray-400 mt-1">wire's temperature right now</div>
            </div>
          </div>
        </div>

        {/* Readout */}
        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-3">What's happening</h2>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm">
            {[
              ['🚧 Resistance', levelWord(res, [0.4, 0.9])],
              ['⚡ Current flowing', levelWord(cur, [1.2, 2.4])],
              ['🔥 Heat being made', levelWord(pow, [1.5, 4])],
            ].map(([label, val], i, arr) => (
              <div key={i} className={`flex justify-between py-2 ${i < arr.length - 1 ? 'border-b border-dashed border-slate-200' : ''}`}>
                <span className="text-gray-500 font-medium">{label}</span>
                <span className="font-bold" style={{ color: HEAT }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Observation */}
        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-2">💡 In simple words</h2>
          <div className="bg-orange-50 border-l-4 border-orange-500 rounded-r-xl px-4 py-3 text-sm text-gray-800 leading-relaxed">
            {obsText}
          </div>
        </div>

        {/* Real-world examples */}
        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-3">🏠 Where you see this at home</h2>
          <ul className="text-sm text-gray-500 space-y-2 pl-4 list-disc">
            <li><span className="font-bold text-gray-700">Electric iron</span> — a nichrome coil inside gets hot and presses your clothes.</li>
            <li><span className="font-bold text-gray-700">Room heater</span> — a glowing coil warms up the room.</li>
            <li><span className="font-bold text-gray-700">Immersion rod</span> — heats water for a bath.</li>
            <li><span className="font-bold text-gray-700">Electric furnace</span> — huge current makes metal extremely hot to melt it.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}