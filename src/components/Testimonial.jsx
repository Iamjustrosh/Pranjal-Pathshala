import React from 'react';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper modules
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

// Import Swiper styles (these should also be imported in your main CSS, e.g., index.css)
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const testimonials = [
  {
    name: 'Mrs. Sunita Sharma',
    studentClass: 'Parent of Class 8 Student',
    rating: 5,
    content:
      'Pranjal Pathshala has been a blessing for my child. The teachers are very supportive and the study material is easy to understand. My son has shown remarkable improvement in his grades.',
  },
  {
    name: 'Mr. Rajeev Kumar',
    studentClass: 'Parent of Class 10 Student',
    rating: 5,
    content:
      'The coaching here is very result-oriented. Concepts are explained from basics, which has really boosted my daughter’s confidence for her board exams.',
  },
  {
    name: 'Mrs. Meena Gupta',
    studentClass: 'Parent of Class 6 Student',
    rating: 5,
    content:
      'Excellent teaching methods and personal attention to every student. My child enjoys learning, and the regular tests keep her on track throughout the year.',
  },
  {
    name: 'Anshul Verma',
    studentClass: 'Class 9 Student',
    rating: 4,
    content:
      'The teachers clear every doubt patiently. The notes and practice questions helped me improve a lot in Maths and Science in just a few months.',
  },
  {
    name: 'Priya Singh',
    studentClass: 'Class 10 Student',
    rating: 5,
    content:
      'I used to be afraid of Physics, but now I actually enjoy solving numericals. The way topics are broken down makes everything easier to understand.',
  },
];

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        <i className="ri-star-fill"></i>
      </span>
    ))}
    <span className="ml-2 text-sm text-gray-500 poppins-medium">Rated {rating}/5</span>
  </div>
);

const getInitials = (name = '') => {
  const parts = name.split(' ').filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Testimonial = () => {
  return (
    <section className="py-10 md:py-14">
      <div className="px-2 sm:px-4 md:px-0 max-w-6xl mx-auto pb-10 md:pb-14">
        <Swiper
          spaceBetween={24}
          slidesPerView={1}
          loop
          autoplay={{
            delay: 5500,
            disableOnInteraction: false,
          }}
          speed={650}
          modules={[Pagination, Navigation, Autoplay]}
          className="testimonial-swiper"
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
        >
          {testimonials.map((t, idx) => (
            <SwiperSlide key={idx}>
              <article className="h-full">
                <div className="relative flex h-full flex-col rounded-3xl bg-white/90 px-5 py-6 md:px-6 md:py-7 shadow-[0_18px_40px_rgba(148,163,184,0.25)] border border-blue-100/70 hover:border-blue-200 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(148,163,184,0.35)] transition-all duration-200">
                  {/* Accent top bar */}
                  {/* <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#BFDBFE] via-[#E0F2FE] to-[#BFDBFE]" /> */}

                  {/* Quote icon */}
                  <div className="mb-3 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-[#3B82F6] poppins-semibold text-lg shadow-inner">
                        {getInitials(t.name)}
                      </div>
                      <div>
                        <h3 className="text-base md:text-lg poppins-semibold text-gray-900">
                          {t.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500">{t.studentClass}</p>
                      </div>
                    </div>
                    <span className="text-3xl md:text-4xl text-orange-200 -mt-2 select-none leading-none">
                      “
                    </span>
                  </div>

                  <StarRating rating={t.rating} />

                  <p className="mt-4 text-sm md:text-[15px] leading-relaxed text-gray-700 flex-1">
                    {t.content}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-[11px] md:text-xs text-gray-400">
                    <span>Real feedback from our learners & parents</span>
                    <span className="inline-flex items-center gap-1 text-[#3B82F6]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#93C5FD]" />
                      Caring Mentors
                    </span>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonial;