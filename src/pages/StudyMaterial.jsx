import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const NCERT_BOOKS_URL = "https://ncert.nic.in/textbook.php";
const NCERT_SOLUTIONS_URL = "https://www.learncbse.in/ncert-solutions-2/";

// 3D card styles for "Other Materials"
const card3DBase =
  "relative bg-white border border-gray-200 rounded-xl shadow-2xl p-6 flex justify-between items-center transition-transform duration-300";
const card3DStatic =
  "before:content-[''] before:absolute before:inset-0 before:rounded-xl before:shadow-[0_8px_24px_rgba(0,0,0,0.18),0_1.5px_0_#cbd5e1] before:-z-10";
const card3DHover =
  "hover:-translate-y-2 hover:scale-105 hover:shadow-[0_16px_32px_rgba(59,130,246,0.18),0_3px_0_#3b82f6] hover:ring-2 hover:ring-blue-400 hover:ring-offset-2";

// 3D shadow for buttons
const button3D =
  "shadow-[0_4px_16px_rgba(59,130,246,0.18),0_1.5px_0_#3b82f6] transition-transform duration-200";
const button3DHover =
  "hover:-translate-y-1 hover:scale-105 hover:shadow-[0_8px_24px_rgba(59,130,246,0.25),0_3px_0_#2563eb]";

const StudyMaterial = () => {
  const [selectedOption, setSelectedOption] = useState('ncert_books');
  const [materials, setMaterials] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [filteredMaterials, setFilteredMaterials] = useState([]);


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
      temp = temp.filter(m => m.class === selectedClass);
    }
    if (selectedSubject) {
      temp = temp.filter(m => m.subject === selectedSubject);
    }
    setFilteredMaterials(temp);
  }, [materials, selectedClass, selectedSubject]);


  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center">Study Materials</h1>
      <div className="flex justify-center space-x-4 mb-6">
        <a
          href={NCERT_BOOKS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-4 py-2 rounded ${selectedOption === 'ncert_books' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} ${button3D} ${button3DHover} flex items-center justify-center`}
          style={{ textDecoration: 'none' }}
        >
          NCERT Books
        </a>
        <a
          href={NCERT_SOLUTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-4 py-2 rounded ${selectedOption === 'ncert_solutions' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} ${button3D} ${button3DHover} flex items-center justify-center`}
          style={{ textDecoration: 'none' }}
        >
          NCERT Solutions
        </a>
        <button
          className={`px-4 py-2 rounded ${selectedOption === 'other' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} ${button3D} ${button3DHover}`}
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
              className="border p-2 rounded"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {[...new Set(materials.map(m => m.class))].sort().map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>

            <select
              className="border p-2 rounded"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {[...new Set(materials.map(m => m.subject))].sort().map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <ul className="space-y-6">
            {filteredMaterials.length === 0 && <li>No study materials found.</li>}
            {filteredMaterials.map((item) => (
              <li
                key={item.id}
                className={`${card3DBase} ${card3DStatic} ${card3DHover} group`}
                style={{
                  boxShadow:
                    "0 8px 24px rgba(0,0,0,0.18), 0 1.5px 0 #cbd5e1, 0 0.5px 0 #e0e7ef",
                  transform: "perspective(800px) rotateX(2deg) rotateY(-2deg)",
                  background: "linear-gradient(135deg, #f8fafc 80%, #e0e7ef 100%)",
                }}
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 drop-shadow-sm">{item.title}</h2>
                  <p className="text-gray-700">Class: {item.class} | Subject: {item.subject}</p>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-700 group-hover:rotate-2"
                  style={{ boxShadow: "0 4px 16px rgba(59,130,246,0.18)" }}
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

    </div>
  );
};

export default StudyMaterial;
