import React from 'react';

const NCERT_BOOKS_URL = "https://ncert.nic.in/textbook.php";
const NCERT_SOLUTIONS_URL = "https://www.learncbse.in/ncert-solutions-2/";

// 3D shadow for buttons
const button3D =
  "shadow-[0_4px_16px_rgba(96,165,250,0.24)] transition-transform duration-200";
const button3DHover =
  "hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(96,165,250,0.32)]";

const StudyMaterial = () => {
  return (
    <section className="min-h-[60vh] px-4 py-10 md:py-14 flex items-center justify-center">
      <div className="space-y-8 max-w-4xl mx-auto w-full">
        <div className="text-center space-y-4">
          <p className="text-xs md:text-sm uppercase tracking-[0.24em] text-slate-500 poppins-medium">
            Official Resources
          </p>
          <h1 className="text-3xl md:text-4xl poppins-bold text-slate-900">
            NCERT <span className="text-[#3B82F6]">Library</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            Access official textbooks and solutions directly from the source. 
            <br />
            <span className="text-slate-400 text-xs mt-2 block">(For coaching specific notes, please login to your Student Dashboard)</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <a
            href={NCERT_BOOKS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-lg ${button3D} ${button3DHover} flex items-center justify-center gap-2 group`}
          >
            NCERT Books
          </a>
          
          <a
            href={NCERT_SOLUTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-8 py-4 rounded-2xl bg-[#eff6ff] border border-blue-200 text-blue-700 font-semibold text-lg ${button3D} ${button3DHover} flex items-center justify-center gap-2`}
          >
            NCERT Solutions
          </a>
        </div>
      </div>
    </section>
  );
};

export default StudyMaterial;