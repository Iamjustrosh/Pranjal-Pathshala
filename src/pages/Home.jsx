import React from 'react'
import Hero from '../components/Hero'
import star from '../assets/star.png'
import bookbulb from '../assets/book-bulb.png'
import globe from '../assets/globe.png'
import sandclock from '../assets/sand-clock.png'
// import goodies from '../assets/goodies.png' // Removed as per instruction
import getInTouch from '../assets/getInTouch.png'
import Testimonial from '../components/Testimonial'
import { Link } from 'react-router-dom'

const featureCards = [
  {
    title: "All Subjects From Class 1 to 8",
    img: bookbulb,
    imgAlt: "bookBulb",
    gradient: "from-pink-100 to-orange-50",
  },
  {
    title: "Physics, Chemistry and Maths for Class 9 and 10",
    img: globe,
    imgAlt: "globe",
    gradient: "from-blue-100 to-green-50",
  },
  {
    title: "Learn Programming with Python",
    img: sandclock,
    imgAlt: "sandclock",
    gradient: "from-orange-100 to-yellow-50",
  }
];

const goodiesList = [
  {
    // emoji can be improved to small svg if needed
    icon: "📓",
    name: "Premium Notebooks",
    desc: "Quality notebooks to jot down every important concept and solution.",
  },
  {
    icon: "🖊️",
    name: "Stationery Kits",
    desc: "Pencil boxes with all essential stationery – pencils, pens, erasers, and more.",
  },
  {
    icon: "📚",
    name: "Free Study Materials",
    desc: "Get specially curated study material designed for your academic needs.",
  },
];

const Home = () => {
  return (
    <>
      <div className='px-2 md:px-8 lg:px-16 bg-gradient-to-b from-[#FFF7F0] via-white to-[#FFF2E0] min-h-screen'>
        <Hero />

        {/* Section 3 - Learning Offerings */}
        <div className="section-3 relative py-14">
          <h1 className='text-4xl md:text-6xl poppins-black leading-tight text-center mb-12 tracking-tight'>
            Simplified <span className='text-[#3B82F6] drop-shadow-[0_8px_22px_rgba(59,130,246,0.35)]'>Learning</span> <br className="hidden md:block" /> 
            from Basics to <span className='text-[#3B82F6] drop-shadow-[0_8px_22px_rgba(59,130,246,0.35)]'>Brilliance</span>
          </h1>
          <div className='s-materials grid grid-cols-1 md:grid-cols-3 gap-8 justify-center items-stretch'>
            {featureCards.map((card, idx) => (
              <div
                key={idx}
                className={
                  `s-material-box flex flex-col justify-between rounded-3xl shadow-xl border border-orange-100 hover:border-orange-300 transition cursor-pointer bg-gradient-to-br ${card.gradient} relative overflow-hidden group`
                }
                style={{ minHeight: '260px' }}
              >
                <div className="upper px-7 pt-8">
                  <h2 className='text-2xl md:text-2xl poppins-semibold mb-3 text-gray-900'>
                    {card.title}
                  </h2>
                </div>
                <div className="lower flex items-end justify-between px-7 pb-8">
                  <div className="logo flex-shrink-0 flex items-center">
                    <img src={card.img} alt={card.imgAlt} className='w-20 rounded-xl shadow group-hover:scale-105 transition' />
                  </div>
                  <i className="ri-arrow-right-up-line text-[#60A5FA] text-5xl md:text-6xl group-hover:translate-x-2 transition"></i>
                </div>
                {/* Decorative element */}
                <div className="absolute top-0 right-0 opacity-10 w-32 h-32 bg-[radial-gradient(circle,rgba(255,145,77,0.13)_0%,transparent_70%)] pointer-events-none"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Link to="/study-material">
              <button className="mt-10 mb-6 px-10 py-3 text-center bg-[#60A5FA] text-white text-xl poppins-medium rounded-2xl shadow-lg hover:bg-[#3B82F6] hover:scale-105 active:scale-95 transition duration-200">
                Get Study Material
              </button>
            </Link>
          </div>
        </div>

        {/* Section 2 - Custom Goodies Offer */}
        <div className="section-2 mb-8 mt-8 flex justify-center">
          <div className="w-full max-w-4xl bg-gradient-to-br from-[#FFF5EB] via-[#FFF] to-[#FFF4E6] rounded-2xl shadow-2xl flex flex-col md:flex-row items-center py-8 px-6 md:py-12 md:px-12 border border-orange-100">
            <div className="flex-1 mb-6 md:mb-0 md:pr-10 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl poppins-bold text-[#3B82F6] mb-2 tracking-wide">We Love Surprising Our Learners!</h2>
              <p className="text-lg md:text-xl text-gray-700 mb-4">
                <span className="poppins-semibold">Free Goodies for Every Student:</span>
              </p>
              <p className="text-gray-700 mb-2">
                At Pranjal Pathshala, we believe in rewarding hard work! Every student enjoys exciting freebies to make learning more enjoyable.
              </p>
            </div>
            <div className="flex-1 flex flex-col space-y-4 w-full">
              {goodiesList.map((goodie, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-orange-50 transition group">
                  <div className="text-3xl md:text-4xl">{goodie.icon}</div>
                  <div>
                    <div className="text-lg md:text-xl poppins-semibold text-[#3B82F6] group-hover:underline">{goodie.name}</div>
                    <div className="text-gray-600 text-base">{goodie.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Section 4 - Testimonials */}
        <div className="section-4 mb-12">
          <div className="heading-section-3 mt-8 flex flex-col items-center">
            <h1 className='text-3xl md:text-5xl poppins-bold text-center'>
              What our <span className='text-[#3B82F6]'>Students</span> &
            </h1>
            <div className='flex items-center md:gap-4 justify-center'>
              <h1 className='text-3xl md:text-5xl poppins-bold text-center'><span className='text-[#3B82F6]'>Parents </span> Say</h1>
              <img src={star} alt="star" className="w-10 md:w-16 inline-block ml-2" />
            </div>
          </div>
          <div className="mt-8">
            <Testimonial />
          </div>
        </div>
        
        {/* Section 5 - Map */}
        <div className="section-5 mb-8">
          <div className="map-container flex justify-center items-center w-full h-[340px] md:h-[480px] my-6 drop-shadow-md rounded-2xl overflow-hidden bg-orange-50 border border-orange-100">
            <iframe
              className='md:w-[60%] w-full h-full rounded-2xl'
              title="Pranjal Pathshala Location"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d453.62062342303767!2d80.82440947531917!3d24.55587201098655!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39847fa29e0df0b1%3A0xb3ff3cb7b79fa546!2sPranjal%20Pathshala!5e0!3m2!1sen!2sin!4v1759336216112!5m2!1sen!2sin"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0, height: "100%" }}
            ></iframe>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home