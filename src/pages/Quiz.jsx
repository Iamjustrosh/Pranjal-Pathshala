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
    return (
      <section className="min-h-[60vh] flex items-center justify-center r px-4 py-10">
        <div className="max-w-lg w-full text-center rounded-3xl bg-white/90 border border-blue-100/70 shadow-[0_20px_60px_rgba(148,163,184,0.35)] px-6 py-10">
          <h1 className="text-2xl md:text-3xl poppins-bold text-slate-900 mb-3">
            Live Quiz
          </h1>
          <p className="text-slate-600 mb-4">
            Currently, koi live quiz available nahi hai.
          </p>
          <p className="text-sm text-slate-500">
            Naye quizzes aur practice tests jald hi yahan dikhai denge. Regularly check karte
            rahein!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[70vh] r px-4 py-10 md:py-14">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-10 space-y-2">
          <p className="text-xs md:text-sm uppercase tracking-[0.24em] text-slate-500 poppins-medium">
            Practice • Compete • Improve
          </p>
          <h1 className="text-3xl md:text-4xl poppins-bold text-slate-900">
            Live <span className="text-[#3B82F6]">Quiz</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            Join the ongoing quiz and test your understanding in a time-bound, exam-like
            environment.
          </p>
        </div>

        <div className="relative rounded-3xl bg-white/90 border border-blue-100/70 shadow-[0_22px_70px_rgba(148,163,184,0.35)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#BFDBFE] via-[#E0F2FE] to-[#BFDBFE]" />
          <div className="p-3 md:p-4 lg:p-6">
            <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50/60">
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Quiz;
