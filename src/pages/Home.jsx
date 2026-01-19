import React from 'react'
import Hero from '../components/Hero'
import star from '../assets/star.png'
import bookbulb from '../assets/book-bulb.png'
import globe from '../assets/globe.png'
import sandclock from '../assets/sand-clock.png'
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
    icon: "https://img.icons8.com/?size=100&id=1Z0XRfLWlnbO&format=png&color=000000",
    name: "Premium Notebooks",
    desc: "Quality notebooks to jot down every important concept and solution.",
  },
  {
    icon: "https://img.icons8.com/?size=100&id=0La316f1bWwv&format=png&color=000000",
    name: "Stationery Kits",
    desc: "Pencil boxes with all essential stationery – pencils, pens, erasers, and more.",
  },
  {
    icon: "https://img.icons8.com/?size=100&id=1zQ18rtn1bXI&format=png&color=000000",
    name: "Free Study Materials",
    desc: "Get specially curated study material designed for your academic needs.",
  },
];

const Home = () => {
  return (
    <div className=" min-h-screen bg-gradient-to-br from-[#EEF2FF] via-[#FFFFFF] to-[#E0F2FE] ">

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <Hero />
        </div>
      </section>

      {/* Learning Offerings */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl poppins-black leading-tight text-center mb-16 tracking-tight">
            Simplified <span className="text-[#3B82F6] drop-shadow-[0_8px_22px_rgba(59,130,246,0.35)]">Learning</span> <br className="hidden md:block" />
            from Basics to <span className="text-[#3B82F6] drop-shadow-[0_8px_22px_rgba(59,130,246,0.35)]">Brilliance</span>
          </h1>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featureCards.map((card, idx) => (
              <div
                key={idx}
                className={`rounded-3xl shadow-xl border border-orange-100 hover:border-orange-300 transition cursor-pointer bg-gradient-to-br ${card.gradient} relative overflow-hidden group flex flex-col justify-between`}
                style={{ minHeight: '260px' }}
              >
                <div className="px-7 pt-8">
                  <h2 className="text-2xl poppins-semibold text-gray-900 mb-3">
                    {card.title}
                  </h2>
                </div>

                <div className="flex items-end justify-between px-7 pb-8">
                  <img src={card.img} alt={card.imgAlt} className="w-20 rounded-xl shadow group-hover:scale-105 transition" />
                  <i className="ri-arrow-right-up-line text-[#60A5FA] text-5xl md:text-6xl group-hover:translate-x-2 transition"></i>
                </div>

                <div className="absolute top-0 right-0 opacity-10 w-32 h-32 bg-[radial-gradient(circle,rgba(255,145,77,0.13)_0%,transparent_70%)]"></div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Link to="/study-material">
              <button className="mt-12 px-10 py-3 text-center bg-[#60A5FA] text-white text-xl poppins-medium rounded-2xl shadow-lg hover:bg-[#3B82F6] hover:scale-105 active:scale-95 transition">
                Get Study Material
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Goodies */}
      <section className="py-24 relative">
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.18)_0%,transparent_75%)] blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-44 h-44 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.13)_0%,transparent_75%)] blur-2xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          {/* Heading */}
          <h1 className="text-4xl md:text-6xl poppins-black leading-tight text-center mb-16 tracking-tight">
            <span className="flex flex-col items-center justify-center gap-2">
              <span className="inline-flex items-center gap-3 justify-center px-7 py-2 rounded-full bg-[#fef9c3]/80 border border-yellow-200 drop-shadow-lg shadow-yellow-100 text-[#fbbf24] text-3xl md:text-4xl poppins-bold animate-bounce mb-2">
                <i className="ri-gift-2-fill text-4xl md:text-5xl" />
                Free Goodies
              </span>
              <span>
                by <span className="text-[#3B82F6] drop-shadow-[0_8px_22px_rgba(59,130,246,0.35)]">Pranjal Pathshala</span>
              </span>
            </span>
          </h1>

          <div className="w-full flex flex-col md:flex-row gap-12 items-center py-12 px-6 md:px-8 ">
            {/* Left */}
            <div className="flex-1 mb-10 md:mb-0 md:pr-12 text-center md:text-left flex flex-col items-center md:items-start">
              <h2 className="text-3xl md:text-4xl poppins-bold text-[#3B82F6] mb-3 drop-shadow-[0_8px_28px_rgba(59,130,246,0.10)]">We Love Surprising Our Learners!</h2>
              <p className="text-lg md:text-xl text-gray-700 mb-4 flex items-center gap-2">
                <span className="poppins-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-base">Free Goodies for Every Student</span>
                <i className="ri-bubble-chart-fill text-[#60A5FA] text-2xl" />
              </p>
              <p className="text-gray-700 text-base md:text-lg max-w-lg">
                At <span className="font-semibold text-[#3B82F6]">Pranjal Pathshala</span>, we believe in rewarding hard work! Every student enjoys <span className="text-[#fbbf24] font-semibold">exciting freebies</span> to make learning more enjoyable and memorable.
              </p>
              <div className="flex items-center gap-2 mt-6">
                <i className="ri-trophy-fill text-yellow-400 text-3xl"></i>
                <span className="text-sm text-slate-500">Because achievement deserves to be celebrated!</span>
              </div>
            </div>

            {/* Right */}
            <div className="flex-1 w-full">
              <div className="flex flex-col gap-6">
                {goodiesList.map((goodie, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-5 p-5 rounded-2xl bg-white shadow hover:shadow-lg border border-yellow-100 hover:border-yellow-200 transition-all duration-150 cursor-pointer group relative overflow-hidden"
                  >
                    <div className={`text-5xl flex-shrink-0 drop-shadow-xl group-hover:scale-110 transition-transform duration-200 z-10`}>
                      <img src={goodie.icon} alt="" />
                    </div>
                    <div>
                      <div className="text-lg md:text-xl poppins-semibold text-[#3B82F6] group-hover:text-[#f59e42] transition">{goodie.name}</div>
                      <div className="text-gray-600 text-sm md:text-base">{goodie.desc}</div>
                    </div>
                    {/* Bubble effect background */}
                    <span className="absolute left-0 top-0 w-20 h-20 bg-[radial-gradient(circle,rgba(251,191,36,0.11)_0%,transparent_80%)] -z-10 blur-sm group-hover:scale-125 transition-all duration-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <h1 className="text-4xl md:text-5xl poppins-bold">
            What our <span className="text-[#3B82F6]">Students</span> &
          </h1>
          <div className="flex items-center justify-center gap-3 mt-2">
            <h1 className="text-4xl md:text-5xl poppins-bold">
              <span className="text-[#3B82F6]">Parents</span> Say
            </h1>
            <img src={star} alt="star" className="w-10 md:w-14" />
          </div>

          <div className="mt-12">
            <Testimonial />
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="rounded-2xl overflow-hidden w-full h-[350px] md:h-[500px] shadow-lg border border-orange-100 bg-orange-50">
            <iframe
              className="w-full h-full"
              title="Pranjal Pathshala Location"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d453.62062342303767!2d80.82440947531917!3d24.55587201098655!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39847fa29e0df0b1%3A0xb3ff3cb7b79fa546!2sPranjal%20Pathshala!5e0!3m2!1sen!2sin!4v1759336216112!5m2!1sen!2sin"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0 }}
            ></iframe>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home
