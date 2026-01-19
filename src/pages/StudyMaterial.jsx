import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const NCERT_BOOKS_URL = "https://ncert.nic.in/textbook.php";
const NCERT_SOLUTIONS_URL = "https://www.learncbse.in/ncert-solutions-2/";

// 3D card styles for "Other Materials"
const card3DBase =
  "relative bg-white border border-blue-100/80 rounded-2xl shadow-[0_16px_45px_rgba(148,163,184,0.28)] p-5 md:p-6 flex justify-between items-center transition-transform duration-300";
const card3DStatic =
  "before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:shadow-[0_0_0_rgba(0,0,0,0)] before:-z-10";
const card3DHover =
  "hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(148,163,184,0.35)] hover:border-blue-200";

// 3D shadow for buttons
const button3D =
  "shadow-[0_4px_16px_rgba(96,165,250,0.24)] transition-transform duration-200";
const button3DHover =
  "hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(96,165,250,0.32)]";

const StudyMaterial = () => {
  const [selectedOption, setSelectedOption] = useState('ncert_books');
  const [materials, setMaterials] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [filteredMaterials, setFilteredMaterials] = useState([]);

  // Normalization helpers to remove duplicacy in filter options
  const normalizeValue = (value) => String(value ?? '').trim().toLowerCase();
  const toTitleCase = (text) => String(text ?? '')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Build unique, normalized lists for filter dropdowns
  const uniqueClasses = Array.from(
    new Map(
      materials.map((m) => {
        const raw = m.class;
        const normalized = normalizeValue(raw);
        // Keep trimmed raw for display/value when numeric; otherwise keep trimmed string
        const trimmedRaw = String(raw ?? '').trim();
        return [normalized, trimmedRaw];
      })
    ).values()
  )
    .filter(Boolean)
    .sort((a, b) => {
      const na = parseInt(a, 10);
      const nb = parseInt(b, 10);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });

  const uniqueSubjects = Array.from(
    new Map(
      materials.map((m) => {
        const raw = m.subject;
        const normalized = normalizeValue(raw);
        const display = toTitleCase(raw);
        return [normalized, display];
      })
    ).values()
  )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));


  useEffect(() => {
    if (selectedOption === 'other') {
      const fetch = async () => {
        const snapshot = await getDocs(collection(db, 'materials'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMaterials(data);
      };
      fetch();
    }
  }, [selectedOption]);

  useEffect(() => {
    let temp = materials;
    if (selectedClass) {
      temp = temp.filter((m) => normalizeValue(m.class) === normalizeValue(selectedClass));
    }
    if (selectedSubject) {
      temp = temp.filter((m) => normalizeValue(m.subject) === normalizeValue(selectedSubject));
    }
    setFilteredMaterials(temp);
  }, [materials, selectedClass, selectedSubject]);


  return (
    <section className="min-h-[70vh] bg-gradient-to-b from-[#EEF2FF] via-white to-[#E0F2FE] px-4 py-10 md:py-14">
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <p className="text-xs md:text-sm uppercase tracking-[0.24em] text-slate-500 poppins-medium">
            Smart Resources For Smart Learning
          </p>
          <h1 className="text-3xl md:text-4xl poppins-bold text-slate-900">
            Study <span className="text-[#3B82F6]">Materials</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            NCERT books, solutions, aur hamare curated notes – sab kuch ek jagah. Apne class aur
            subject ke hisaab se material choose karein.
          </p>
        </div>

        <div className="flex justify-center flex-wrap gap-3 md:gap-4 mb-4 md:mb-6">
          <a
            href={NCERT_BOOKS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-4 py-2 rounded-full text-sm md:text-base ${
              selectedOption === 'ncert_books'
                ? 'bg-[#DBEAFE] text-[#1D4ED8] border border-blue-200'
                : 'bg-white text-slate-700 border border-slate-200'
            } ${button3D} ${button3DHover} flex items-center justify-center`}
            style={{ textDecoration: 'none' }}
          >
            NCERT Books
          </a>
          <a
            href={NCERT_SOLUTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-4 py-2 rounded-full text-sm md:text-base ${
              selectedOption === 'ncert_solutions'
                ? 'bg-[#DBEAFE] text-[#1D4ED8] border border-blue-200'
                : 'bg-white text-slate-700 border border-slate-200'
            } ${button3D} ${button3DHover} flex items-center justify-center`}
            style={{ textDecoration: 'none' }}
          >
            NCERT Solutions
          </a>
          <button
            className={`px-4 py-2 rounded-full text-sm md:text-base ${
              selectedOption === 'other'
                ? 'bg-[#DBEAFE] text-[#1D4ED8] border border-blue-200'
                : 'bg-white text-slate-700 border border-slate-200'
            } ${button3D} ${button3DHover}`}
            onClick={() => setSelectedOption('other')}
          >
            Other Materials
          </button>
        </div>

        {/* Remove iframe for ncert_books and ncert_solutions */}
        {selectedOption === 'other' && (
          <>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <select
              className="border border-slate-200 bg-white/90 text-slate-800 px-3 py-2 rounded-xl text-sm md:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {uniqueClasses.map((cls) => (
                <option key={normalizeValue(cls)} value={cls}>Class {cls}</option>
              ))}
            </select>

            <select
              className="border border-slate-200 bg-white/90 text-slate-800 px-3 py-2 rounded-xl text-sm md:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map((sub) => (
                <option key={normalizeValue(sub)} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <ul className="space-y-6">
            {filteredMaterials.length === 0 && (
              <li className="text-center text-slate-500 text-sm md:text-base">
                No study materials found. Try changing the filters.
              </li>
            )}
            {filteredMaterials.map((item) => (
              <li
                key={item.id}
                className={`${card3DBase} ${card3DStatic} ${card3DHover} group`}
                style={{
                  boxShadow:
                    "0 16px 45px rgba(148,163,184,0.26)",
                  transform: "perspective(900px) rotateX(1.5deg) rotateY(-1.5deg)",
                  background: "linear-gradient(135deg, #F9FAFB 76%, #E0F2FE 100%)",
                }}
              >
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 drop-shadow-sm">{item.title}</h2>
                  <p className="text-sm md:text-base text-gray-700">
                    Class: {item.class} | Subject: {item.subject}
                  </p>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#60A5FA] text-white px-4 py-2 rounded-full text-sm md:text-base shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-[#3B82F6] group-hover:rotate-1"
                  style={{ boxShadow: "0 4px 16px rgba(96,165,250,0.22)" }}
                >
                  View
                </a>
              </li>
            ))}
          </ul>
          </>
        )}
      </div>
    </section>
  );
};

export default StudyMaterial;
