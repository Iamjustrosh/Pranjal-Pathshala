import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const NCERT_BOOKS_URL = "https://ncert.nic.in/textbook.php";
const NCERT_SOLUTIONS_URL = "https://www.learncbse.in/ncert-solutions-2/";

const StudyMaterial = () => {
  const [selectedOption, setSelectedOption] = useState('ncert_books');
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    if (selectedOption === 'other') {
      const fetch = async () => {
        const snapshot = await getDocs(collection(db, 'materials'));
        setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };
      fetch();
    }
  }, [selectedOption]);

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center">Study Materials</h1>
      <div className="flex justify-center space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${selectedOption === 'ncert_books' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          onClick={() => setSelectedOption('ncert_books')}
        >
          NCERT Books
        </button>
        <button
          className={`px-4 py-2 rounded ${selectedOption === 'ncert_solutions' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          onClick={() => setSelectedOption('ncert_solutions')}
        >
          NCERT Solutions
        </button>
        <button
          className={`px-4 py-2 rounded ${selectedOption === 'other' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          onClick={() => setSelectedOption('other')}
        >
          Other Materials
        </button>
      </div>

      {selectedOption === 'ncert_books' && (
        <div className="text-center">
          <a
            href={NCERT_BOOKS_URL}
            target="_blank"
            rel="noreferrer"
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 inline-block"
          >
            Go to NCERT Books
          </a>
        </div>
      )}

      {selectedOption === 'ncert_solutions' && (
        <div className="text-center">
          <a
            href={NCERT_SOLUTIONS_URL}
            target="_blank"
            rel="noreferrer"
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 inline-block"
          >
            Go to NCERT Solutions
          </a>
        </div>
      )}

      {selectedOption === 'other' && (
        <ul className="space-y-4">
          {materials.length === 0 && <li>No study materials available.</li>}
          {materials.map((item) => (
            <li key={item.id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p>Class: {item.class} | Subject: {item.subject}</p>
              </div>
              <a href={item.url} target="_blank" rel="noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">View</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudyMaterial;
