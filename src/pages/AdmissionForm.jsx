import React from 'react';

const AdmissionForm = () => {
  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-6">Admission Form</h1>
      <div className="w-full">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSeg4QQy7-3MRoxzhzPX9YtSWJQaQP__2ucss7_Zkt9a5NruQg/viewform?embedded=true"
          width="100%"
          height="1000"
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
          title="Admission Form">
          Loading…
        </iframe>

      </div>
    </div>
  );
};

export default AdmissionForm;
