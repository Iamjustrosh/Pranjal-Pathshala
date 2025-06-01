import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const LiveQuizForm = () => {
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');

  const docRef = doc(db, 'live_quiz', 'current');

  useEffect(() => {
    const fetchLink = async () => {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLink(docSnap.data().formLink);
      }
    };
    fetchLink();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await setDoc(docRef, { formLink: link });
    setMessage('Live quiz link updated!');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Set Live Quiz (Google Form Link)</h2>
      {message && <p className="text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Paste embed link here (must include embedded=true)"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Save Quiz Link
        </button>
      </form>
    </div>
  );
};

export default LiveQuizForm;
