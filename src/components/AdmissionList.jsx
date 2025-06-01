import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const AdmissionList = () => {
  const [admissions, setAdmissions] = useState([]);

  useEffect(() => {
    const fetchAdmissions = async () => {
      const snapshot = await getDocs(collection(db, 'admissions'));
      setAdmissions(snapshot.docs.map(doc => doc.data()));
    };
    fetchAdmissions();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Admission Submissions</h2>
      <ul className="space-y-2">
        {admissions.map((entry, index) => (
          <li key={index} className="border p-4 rounded">
            <p><strong>Name:</strong> {entry.name}</p>
            <p><strong>Phone:</strong> {entry.phone}</p>
            <p><strong>Class:</strong> {entry.class}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdmissionList;