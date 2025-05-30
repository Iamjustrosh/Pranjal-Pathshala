import React from 'react';

const testimonials = [
  {
    name: "Mrs. Sunita Sharma",
    studentClass: "Class 8",
    rating: 5,
    content:
      "Pranjal Pathshala has been a blessing for my child. The teachers are very supportive and the study material is easy to understand. My son has shown remarkable improvement in his grades.",
  },
  {
    name: "Mr. Rajeev Kumar",
    studentClass: "Class 10",
    rating: 4,
    content:
      "The coaching here is very result-oriented. My daughter feels more confident in Maths and Science now. Highly recommended for board exam preparation.",
  },
  {
    name: "Mrs. Meena Gupta",
    studentClass: "Class 6",
    rating: 5,
    content:
      "Excellent teaching methods and personal attention to every student. My child enjoys learning and looks forward to the classes every day.",
  },
];

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
        <i className="ri-star-fill"></i>
      </span>
    ))}
    <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
  </div>
);

const Testimonial = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-[#ff924e]">What Parents Say</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start border border-gray-200"
            >
              <div className="mb-2">
                <span className="text-lg font-semibold text-gray-800">{t.name}</span>
                <span className="ml-2 text-sm text-gray-500">({t.studentClass})</span>
              </div>
              <StarRating rating={t.rating} />
              <p className="mt-4 text-gray-700">{t.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonial;