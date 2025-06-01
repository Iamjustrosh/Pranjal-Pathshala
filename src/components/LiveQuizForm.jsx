import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const LiveQuizForm = () => {
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');

  const docRef = doc(db, 'live_quiz', 'current');

  useEffect(() => {
    const fetchLink = async () => {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLink(docSnap.data().formLink || '');
      }
    };
    fetchLink();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await setDoc(docRef, { formLink: link });
    setMessage('Live quiz link updated!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleRemove = async () => {
    if (window.confirm('Are you sure you want to remove the live quiz?')) {
      // Remove the formLink field by setting it to empty string or delete field
      await updateDoc(docRef, { formLink: '' });
      setLink('');
      setMessage('Live quiz link removed!');
      setTimeout(() => setMessage(''), 3000);
    }
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
          required={!link} // Require input only if empty (optional)
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Quiz Link
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Remove Quiz
          </button>
        </div>
      </form>
    </div>
  );
};

export default LiveQuizForm;
