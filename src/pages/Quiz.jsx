import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Quiz = () => {
  const [link, setLink] = useState('');

  useEffect(() => {
    const fetchLink = async () => {
      const docSnap = await getDoc(doc(db, 'live_quiz', 'current'));
      if (docSnap.exists()) {
        setLink(docSnap.data().formLink);
      }
    };
    fetchLink();
  }, []);

  if (!link) {
    return <div className="text-center mt-10 text-xl">No live quiz available.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-6">Live Quiz</h1>
      <iframe
        src={link}
        width="100%"
        height="1000"
        frameBorder="0"
        marginHeight="0"
        marginWidth="0"
        title="Live Quiz"
      >
        Loading…
      </iframe>
    </div>
  );
};

export default Quiz;
