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
    chapter: '',
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
    chapter: '',
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
    chapter: '',
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
    chapter: '',
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
    <div className="min-h-screen bg-[#f4f8fd]">
      <div className="mx-auto max-w-[1080px] px-4 pb-20 pt-8">


        {/* Header */}
        <div className="mb-9">

          <h1 className="mb-2.5 text-[clamp(26px,5vw,38px)] font-bold leading-tight tracking-tight text-[#1c2b3f] poppins-bold">
            Pranjal Labs{' '}
            <span className="font-medium text-[#5c7089]">— Try It Yourself!</span>
          </h1>

          <p className="m-0 max-w-[600px] text-[14.5px] leading-relaxed text-[#5c7089]">
            Pick a lab below and interact with it just like a real science experiment.
            Tap switches, drag sliders, and read what's happening at every step.
          </p>
        </div>

        {/* Stats strip */}
        <div className="mb-8 flex flex-wrap gap-3">
          {[
            { val: '4', label: 'Interactive Labs' },
            { val: '8+', label: 'Controls to Explore' },
            { val: '0', label: 'Installation Needed' },
          ].map(({ val, label }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-[14px] border border-[#dde8f7] bg-white px-[18px] py-2.5 shadow-[0_2px_10px_rgba(47,125,238,0.05)]">
              <span className="text-[22px] font-extrabold text-[#2f7dee] poppins-extrabold">{val}</span>
              <span className="text-[12.5px] font-medium text-[#5c7089]">{label}</span>
            </div>
          ))}
        </div>

        {/* Lab list */}
        <div className="flex flex-col gap-3.5">
          {LABS.map(lab => (
            <LabCard key={lab.id} lab={lab} onSelect={onSelect} />
          ))}
        </div>

        <footer className="mt-12 text-center text-xs text-[#93a5bc]">
          Made with 💙 by <span className="font-bold text-[#2f7dee]">Pranjal Pathshala</span> · Learn by doing, not just reading
        </footer>
      </div>
    </div>
  );
}

function LabCard({ lab, onSelect }) {
  return (
    <div
      className="group relative flex cursor-pointer flex-col items-start gap-4 overflow-hidden rounded-[18px] border border-[#dde8f7] bg-white p-5 shadow-[0_2px_14px_rgba(47,125,238,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(47,125,238,0.13)] active:translate-y-0 sm:flex-row sm:items-center sm:gap-5"
      onClick={() => onSelect(lab.id)}
      style={{ '--lab-color': lab.color, '--lab-dim-color': lab.dimColor }}
    >
      {/* Accent left bar */}
      <div className="absolute inset-y-0 left-0 w-1.5 rounded-l-[18px] bg-[var(--lab-color)]" />

      {/* Icon bubble */}
      <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl bg-[var(--lab-dim-color)] text-[28px]">
        {lab.icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-baseline gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--lab-color)] poppins-extrabold">
            Lab {lab.number}
          </span>
          <span className="text-[11px] text-[#93a5bc]">{lab.chapter}</span>
        </div>

        <div className="mb-1 text-[17px] font-bold leading-tight text-[#1c2b3f] poppins-bold">
          {lab.label}
        </div>

        <div className="mb-1.5 text-xs font-semibold text-[var(--lab-color)]">
          {lab.tagline}
        </div>

        <p className="m-0 max-w-[540px] text-[13px] leading-relaxed text-[#5c7089]">
          {lab.description}
        </p>

        {/* Tags */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {lab.tags.map(tag => (
            <span key={tag} className="rounded-full bg-[var(--lab-dim-color)] px-[9px] py-[3px] text-[11px] font-semibold text-[var(--lab-color)]">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Arrow CTA */}
      <div className="flex shrink-0 flex-col items-center gap-1 self-end sm:self-auto">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--lab-color)]/20 bg-[var(--lab-dim-color)] text-lg text-[var(--lab-color)]">
          →
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--lab-color)]">
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
    <div className="min-h-screen bg-[#f4f8fd]">
      <div className="mx-auto max-w-[1080px] px-4 pb-20 pt-6">

        {/* Top bar */}
        <div className="mb-[22px] flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-[#dde8f7] bg-white px-3.5 py-2.5 text-[13px] font-bold text-[#1c2b3f] shadow-[0_2px_8px_rgba(47,125,238,0.07)] transition hover:border-[#2f7dee]"
          >
            ← All Labs
          </button>

          {/* Breadcrumb */}
          <div className="flex min-w-0 items-center gap-2" style={{ '--lab-color': lab.color, '--lab-dim-color': lab.dimColor }}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--lab-dim-color)] text-[15px]">{lab.icon}</span>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--lab-color)]">
                Lab {lab.number}
              </div>
              <div className="truncate whitespace-nowrap text-sm font-bold text-[#1c2b3f] poppins-bold">
                {lab.label}
              </div>
            </div>
          </div>

          {/* Live indicator */}
          <div className="ml-auto flex items-center gap-1.5" style={{ '--lab-color': lab.color, '--lab-dim-color': lab.dimColor }}>
            <span className="inline-block h-[7px] w-[7px] animate-pulse rounded-full bg-[var(--lab-color)] ring-[3px] ring-[var(--lab-dim-color)]" />
            <span className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-[var(--lab-color)]">
              live
            </span>
          </div>
        </div>

        {/* Lab header */}
        <div className="mb-1 rounded-2xl border border-[var(--lab-color)]/20 bg-[var(--lab-dim-color)] px-5 py-4" style={{ '--lab-color': lab.color, '--lab-dim-color': lab.dimColor }}>
          <div className="mb-1 text-[clamp(20px,4vw,28px)] font-extrabold text-[#1c2b3f] poppins-extrabold">
            {lab.label}
          </div>
          <div className="text-[13.5px] leading-relaxed text-[#5c7089]">
            {lab.description}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {lab.tags.map(tag => (
              <span key={tag} className="rounded-full border border-[var(--lab-color)]/20 bg-white px-[9px] py-[3px] text-[11px] font-semibold text-[var(--lab-color)]">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* The actual lab component */}
        <div key={labId}>
          <LabComponent />
        </div>

        {/* Bottom nav */}
        <div className="mt-7 flex flex-wrap justify-between gap-2.5">
          <button onClick={onBack} className="flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#dde8f7] bg-white px-[18px] py-[11px] text-[13px] font-bold text-[#5c7089] transition hover:border-[#2f7dee]">
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
                className="flex items-center gap-2 rounded-xl border-0 bg-[var(--next-color)] px-[18px] py-[11px] text-[13px] font-bold text-white transition hover:brightness-95"
                style={{ '--next-color': next.color }}
              >
                <span>{next.icon}</span>
                Next: {next.label} →
              </button>
            );
          })()}
        </div>
      </div>

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