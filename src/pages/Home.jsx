import React from 'react'
import Hero from '../components/Hero'
import Testimonial from '../components/Testimonial';
import star from '../assets/star.png'

const Home = () => {
  return (
    <>
      <div className='px-5'>
        <Hero />
        <div className="section-2 relative ">
          <h1 className='text-5xl poppins-bold'>
            Simplified <span className='text-[#ff924e]'>Learning</span> <br /> from Basics to <span className='text-[#ff924e]'>Brilliance</span>
          </h1>
          {/* Removed cards as they will be built in testimonials.jsx */}
          <div className="flex justify-center">
            <button className="mt-4 px-6 py-3 text-center bg-[#ff924e] text-white text-lg font-semibold rounded-xl hover:bg-[#e38a53] transition duration-300">
              Get Study Material
            </button>
          </div>
          {/* Testimonials Section */}
          <div className="mt-16 mb-10 max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-[#ff924e]">
                What Our Students &amp; Parents Say
              </h2>
              <img src={star} alt="star" className="w-10 h-10" />
            </div>
            <Testimonial/>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home