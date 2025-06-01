import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const StudyMaterial = () => {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const snapshot = await getDocs(collection(db, 'materials'));
      setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetch();
  }, []);

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center">Study Materials</h1>
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
    </div>
  );
};

export default StudyMaterial;
