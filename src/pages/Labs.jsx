import React, { useState } from 'react';
import OerstedLab from '../components/Labs/OerstedLab';
import ElectromagnetLab from '../components/Labs/ElectromagnetLab';
import HeatingLab from '../components/Labs/HeatingLab';
import VoltaicLab from '../components/Labs/VoltaicLab';

const LABS = [
  {
    id: 'oersted',
    number: '01',
    label: 'Compass & Current',
    chapter: 'Class 8 · Chapter 4 · Electricity',
    tagline: 'Oersted\'s 1820 Experiment',
    description: 'Discover how a simple current-carrying wire deflects a compass needle. Flip the battery, move the compass closer, and watch the needle swing live.',
    icon: '🧭',
    color: '#2f7dee',
    dimColor: '#d7e7ff',
    accentClass: 'electric',
    tags: ['Magnetic Effect', 'Oersted', 'Compass'],
    component: OerstedLab,
  },
  {
    id: 'electromagnet',
    number: '02',
    label: 'Electromagnet',
    chapter: 'Class 8 · Chapter 4 · Electricity',
    tagline: 'Build & Control a Magnet',
    description: 'Wrap a coil around an iron nail and watch it become a magnet. Control the strength by changing turns, battery power, and whats inside the coil.',
    icon: '🧲',
    color: '#8b5cf6',
    dimColor: '#ece4ff',
    accentClass: 'magnetic',
    tags: ['Electromagnet', 'Coil', 'Iron Core'],
    component: ElectromagnetLab,
  },
  {
    id: 'heating',
    number: '03',
    label: 'Heating Wire',
    chapter: 'Class 8 · Chapter 4 · Electricity',
    tagline: 'Joule\'s Heating Effect',
    description: 'Send current through nichrome, aluminium or copper and watch the wire heat up in real time. See why electric irons and room heaters work.',
    icon: '🔥',
    color: '#ff7a3d',
    dimColor: '#ffe6da',
    accentClass: 'heat',
    tags: ['Heating Effect', 'Joule', 'Resistance'],
    component: HeatingLab,
  },
  {
    id: 'voltaic',
    number: '04',
    label: 'Lemon Battery',
    chapter: 'Class 8 · Chapter 4 · Electricity',
    tagline: 'Chemical → Electrical Energy',
    description: 'Dip two different metals into lemon juice and make your own battery! Also explore the inside of a dry cell with an interactive cutaway.',
    icon: '🍋',
    color: '#1fb15c',
    dimColor: '#dcf6e6',
    accentClass: 'chem',
    tags: ['Voltaic Cell', 'Electrochemistry', 'Dry Cell'],
    component: VoltaicLab,
  },
];

/* ─── Index page ─── */
function LabsIndex({ onSelect }) {
  return (
    <div className="min-h-screen" style={{ background: '#f4f8fd' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 16px 80px' }}>


        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: '#2f7dee',
              boxShadow: '0 0 0 3px #d7e7ff', display: 'inline-block',
              animation: 'blink 1.6s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 11.5,
              letterSpacing: '0.14em', textTransform: 'uppercase', color: '#2f7dee',
            }}>
              Class 8 · Chapter 4 · Electricity
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Poppins,sans-serif', fontWeight: 700,
            fontSize: 'clamp(26px,5vw,38px)', margin: '0 0 10px',
            letterSpacing: '-0.01em', lineHeight: 1.2, color: '#1c2b3f',
          }}>
            Magnetic &amp; Heating Effects{' '}
            <span style={{ color: '#5c7089', fontWeight: 500 }}>— Try It Yourself!</span>
          </h1>

          <p style={{
            color: '#5c7089', fontSize: 14.5, maxWidth: 600,
            lineHeight: 1.65, margin: 0, fontFamily: 'Inter,sans-serif',
          }}>
            Pick a lab below and interact with it just like a real science experiment.
            Tap switches, drag sliders, and read what's happening at every step.
          </p>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32,
        }}>
          {[
            { val: '4', label: 'Interactive Labs' },
            { val: '8+', label: 'Controls to Explore' },
            { val: '0', label: 'Installation Needed' },
          ].map(({ val, label }) => (
            <div key={label} style={{
              background: '#fff', border: '1px solid #dde8f7', borderRadius: 14,
              padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 2px 10px rgba(47,125,238,.05)',
            }}>
              <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 22, color: '#2f7dee' }}>{val}</span>
              <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 12.5, color: '#5c7089', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Lab list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {LABS.map((lab, idx) => (
            <LabCard key={lab.id} lab={lab} idx={idx} onSelect={onSelect} />
          ))}
        </div>

        <footer style={{
          marginTop: 48, textAlign: 'center',
          color: '#93a5bc', fontSize: 12, fontFamily: 'Inter,sans-serif',
        }}>
          Made with 💙 by <span style={{ color: '#2f7dee', fontWeight: 700 }}>Pranjal Pathshala</span> · Learn by doing, not just reading
        </footer>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:.4;} }
        @keyframes fadein { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:none;} }
        .lab-card { transition: transform 0.18s ease, box-shadow 0.18s ease; cursor: pointer; }
        .lab-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(47,125,238,.13) !important; }
        .lab-card:active { transform: translateY(0); }
      `}</style>
    </div>
  );
}

function LabCard({ lab, idx, onSelect }) {
  return (
    <div
      className="lab-card"
      onClick={() => onSelect(lab.id)}
      style={{
        background: '#fff',
        border: '1px solid #dde8f7',
        borderRadius: 18,
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        boxShadow: '0 2px 14px rgba(47,125,238,.05)',
        position: 'relative',
        overflow: 'hidden',
        animation: `fadein 0.35s ease ${idx * 0.07}s both`,
      }}
    >
      {/* Accent left bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 5, borderRadius: '18px 0 0 18px',
        background: lab.color,
      }} />

      {/* Icon bubble */}
      <div style={{
        width: 60, height: 60, borderRadius: 16, flexShrink: 0,
        background: lab.dimColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
      }}>
        {lab.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'Poppins,sans-serif', fontWeight: 800,
            fontSize: 11, letterSpacing: '0.1em', color: lab.color, textTransform: 'uppercase',
          }}>
            Lab {lab.number}
          </span>
          <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 11, color: '#93a5bc' }}>{lab.chapter}</span>
        </div>

        <div style={{
          fontFamily: 'Poppins,sans-serif', fontWeight: 700,
          fontSize: 17, color: '#1c2b3f', lineHeight: 1.2, marginBottom: 4,
        }}>
          {lab.label}
        </div>

        <div style={{
          fontFamily: 'Inter,sans-serif', fontSize: 12, fontWeight: 600,
          color: lab.color, marginBottom: 5,
        }}>
          {lab.tagline}
        </div>

        <p style={{
          fontFamily: 'Inter,sans-serif', fontSize: 13, color: '#5c7089',
          lineHeight: 1.55, margin: 0, maxWidth: 540,
        }}>
          {lab.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {lab.tags.map(tag => (
            <span key={tag} style={{
              fontFamily: 'Inter,sans-serif', fontSize: 11, fontWeight: 600,
              background: lab.dimColor, color: lab.color,
              padding: '3px 9px', borderRadius: 999,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Arrow CTA */}
      <div style={{
        flexShrink: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 4,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: lab.dimColor, border: `1.5px solid ${lab.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: lab.color,
        }}>
          →
        </div>
        <span style={{
          fontFamily: 'Inter,sans-serif', fontSize: 10, fontWeight: 700,
          color: lab.color, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          Open
        </span>
      </div>
    </div>
  );
}

/* ─── Individual lab view ─── */
function LabView({ labId, onBack }) {
  const lab = LABS.find(l => l.id === labId);
  const LabComponent = lab.component;

  return (
    <div style={{ minHeight: '100vh', background: '#f4f8fd' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: '#fff', border: '1.5px solid #dde8f7',
              borderRadius: 10, padding: '9px 14px',
              fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 13,
              color: '#1c2b3f', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(47,125,238,.07)',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = lab.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#dde8f7'}
          >
            ← All Labs
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: lab.dimColor, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 15,
            }}>{lab.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: 'Inter,sans-serif', fontSize: 10, fontWeight: 700,
                color: lab.color, textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                Lab {lab.number}
              </div>
              <div style={{
                fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 700,
                color: '#1c2b3f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {lab.label}
              </div>
            </div>
          </div>

          {/* Live indicator */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: lab.color,
              boxShadow: `0 0 0 3px ${lab.dimColor}`,
              animation: 'blink 1.6s ease-in-out infinite', display: 'inline-block',
            }} />
            <span style={{
              fontFamily: 'Inter,sans-serif', fontSize: 11.5, fontWeight: 700,
              color: lab.color, textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              live
            </span>
          </div>
        </div>

        {/* Lab header */}
        <div style={{
          background: lab.dimColor, border: `1px solid ${lab.color}30`,
          borderRadius: 16, padding: '16px 20px', marginBottom: 4,
        }}>
          <div style={{
            fontFamily: 'Poppins,sans-serif', fontWeight: 800,
            fontSize: 'clamp(20px,4vw,28px)', color: '#1c2b3f', marginBottom: 4,
          }}>
            {lab.label}
          </div>
          <div style={{
            fontFamily: 'Inter,sans-serif', fontSize: 13.5,
            color: '#5c7089', lineHeight: 1.55,
          }}>
            {lab.description}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {lab.tags.map(tag => (
              <span key={tag} style={{
                fontFamily: 'Inter,sans-serif', fontSize: 11, fontWeight: 600,
                background: '#fff', color: lab.color,
                padding: '3px 9px', borderRadius: 999,
                border: `1px solid ${lab.color}30`,
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* The actual lab component */}
        <div key={labId} style={{ animation: 'fadein 0.3s ease' }}>
          <LabComponent />
        </div>

        {/* Bottom nav */}
        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={onBack} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: '#fff', border: '1.5px solid #dde8f7',
            borderRadius: 12, padding: '11px 18px',
            fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 13,
            color: '#5c7089', cursor: 'pointer',
          }}>
            ← Back to All Labs
          </button>

          {/* Next lab button */}
          {(() => {
            const idx = LABS.findIndex(l => l.id === labId);
            const next = LABS[idx + 1];
            if (!next) return null;
            return (
              <button
                onClick={() => onBack(next.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: next.color, border: 'none',
                  borderRadius: 12, padding: '11px 18px',
                  fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 13,
                  color: '#fff', cursor: 'pointer',
                }}
              >
                <span>{next.icon}</span>
                Next: {next.label} →
              </button>
            );
          })()}
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:.4;} }
        @keyframes fadein { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:none;} }
      `}</style>
    </div>
  );
}

/* ─── Root router ─── */
export default function Labs() {
  const [activeLab, setActiveLab] = useState(null);

  const handleSelect = (labId) => {
    setActiveLab(labId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = (nextId) => {
    if (nextId && typeof nextId === 'string') {
      setActiveLab(nextId);
    } else {
      setActiveLab(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (activeLab) {
    return <LabView labId={activeLab} onBack={handleBack} />;
  }

  return <LabsIndex onSelect={handleSelect} />;
}