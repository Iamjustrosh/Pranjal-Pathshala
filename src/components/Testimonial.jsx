import React from 'react';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper modules
import { Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles (these should also be imported in your main CSS, e.g., index.css)
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const testimonials = [
  {
    name: "Mrs. Sunita Sharma",
    studentClass: "Parent Class 8",
    rating: 5,
    content:
      "Pranjal Pathshala has been a blessing for my child. The teachers are very supportive and the study material is easy to understand. My son has shown remarkable improvement in his grades.",
  },
  {
    name: "Mr. Rajeev Kumar",
    studentClass: "Parent Class 10",
    rating: 4,
    content:
      "The coaching here is very result-oriented. My daughter feels more confident in Maths and Science now. Highly recommended for board exam preparation.",
  },
  {
    name: "Mrs. Meena Gupta",
    studentClass: "Parent Class 6",
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
    <section className="py-12 ">
      <div className="px-4">
        <div>
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            navigation={true}
            modules={[Pagination, Navigation]}
            className="mySwiper"
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
                <div
                  className="bg-[#ff924e] text-white rounded-xl shadow-lg p-6 flex flex-col items-start border border-gray-200 min-h-[300px] h-full"
                >
                  <div className="mb-2">
                    <span className="text-lg font-semibold">{t.name}</span> <br />
                    <span className="text-sm">({t.studentClass})</span>
                  </div>
                  <StarRating rating={t.rating} />
                  <p className="mt-4 flex-1">{t.content}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;

// ---
// What to do in index.css:
// Make sure to import Swiper's core and module CSS in your main CSS file (e.g., src/index.css):
//
//   @import 'swiper/css';
//   @import 'swiper/css/pagination';
//   @import 'swiper/css/navigation';
//
// This ensures Swiper's styles are applied globally.