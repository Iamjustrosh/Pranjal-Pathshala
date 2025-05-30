import React from 'react'
import Hero from '../components/Hero'
import star from '../assets/star.png'

const Home = () => {
  return (
    <>
      <div className='px-5'>
        <Hero />
        <div className="section-2 relative ">
          <h1 className='text-5xl poppins-bold'>Simplified <span className='text-[#ff924e]'>Learning</span> <br /> from Basics to <span className='text-[#ff924e]'>Brilliance</span></h1>
          <div className='s-materials flex flex-col md:flex-row gap-7 mt-2'>
            <div className="s-material-box md:w-1/4 pb-7 md:pb-0 px-3 flex flex-col gap-4 border-b-2 md:border-b-0 md:border-r-2">
              <div className="upper">
                <h2 className='text-2xl poppins-semibold mt-6'>All Subjects From
                  Class 1 to 8</h2>
              </div>
              <div className="lower flex justify-between">
                <div className="logo"><img src="src/assets/book-bulb.png" alt="" className='w-20' /></div>
                <i className="ri-arrow-right-up-line text-[#ff924e] text-6xl"></i>
              </div>
            </div>
            <div className="s-material-box md:w-1/4 pb-7 md:pb-0 px-3 flex flex-col gap-4 border-b-2 md:border-b-0 md:border-r-2">
              <div className="upper">
                <h2 className='text-2xl poppins-semibold mt-6'>Physics, Chemsitry and Maths for Class 9 and 10 </h2>
              </div>
              <div className="lower flex justify-between">
                <div className="logo"><img src="src/assets/globe.png" alt="" className='w-20' /></div>
                <i className="ri-arrow-right-up-line text-[#ff924e] text-6xl"></i>
              </div>
            </div>
            <div className="s-material-box md:w-1/4 pb-7 md:pb-0 px-3 flex flex-col gap-4 border-b-2 md:border-b-0 md:border-r-2">
              <div className="upper">
                <h2 className='text-2xl poppins-semibold mt-6'>Learn Programming with Python </h2>
              </div>
              <div className="lower flex justify-between">
                <div className="logo"><img src="src/assets/sand-clock.png" alt="" className='w-20' /></div>
                <i className="ri-arrow-right-up-line text-[#ff924e] text-6xl"></i>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button className="mt-4 px-6 py-3 text-center bg-[#ff924e] text-white text-lg font-semibold rounded-xl hover:bg-[#e38a53] transition duration-300">
              Get Study Material
            </button>
          </div>
          <div className="mt-16 mb-10 max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-[#ff924e]">
                What Our Students &amp; Parents Say
              </h2>
              <img src={star} alt="star" className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home