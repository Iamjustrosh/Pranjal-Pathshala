import React from 'react';

const AdmissionForm = () => {
  return (
    <section className="min-h-[70vh] r px-4 py-10 md:py-14">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 md:mb-10 space-y-2">
          <p className="text-xs md:text-sm uppercase tracking-[0.24em] text-slate-500 poppins-medium">
            Quick & Easy Admission
          </p>
          <h1 className="text-3xl md:text-4xl poppins-bold text-slate-900">
            Admission <span className="text-[#3B82F6]">Form</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            Fill in a few details and secure your seat at Pranjal Pathshala. It takes just a couple
            of minutes and helps us personalize your learning journey.
          </p>
        </div>

        <div className="relative rounded-3xl bg-white/90 border border-blue-100/70 shadow-[0_22px_70px_rgba(148,163,184,0.35)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#BFDBFE] via-[#E0F2FE] to-[#BFDBFE]" />
          <div className="p-3 md:p-4 lg:p-6">
            <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50/60">
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSeg4QQy7-3MRoxzhzPX9YtSWJQaQP__2ucss7_Zkt9a5NruQg/viewform?embedded=true"
                width="100%"
                height="1000"
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                title="Admission Form"
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

export default AdmissionForm;
