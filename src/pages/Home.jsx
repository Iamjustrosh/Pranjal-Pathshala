import React from 'react'
import Hero from '../components/Hero'

const Home = () => {
  return (
    <>
      <div className='px-5'>
        <Hero />
        <div className="section-2">
        <h1 className='text-5xl poppins-bold'>Simplified <span className='text-[#ff924e]'>Learning</span> <br /> from Basics to <span className='text-[#ff924e]'>Brilliance</span></h1>
        <div className='s-materials flex flex-col md:flex-row gap-7 mt-2'>
        </div>
          <div className="s-material-box md:w-1/4 pb-7 md:pb-0 px-3 flex flex-col gap-4 border-b-2 md:border-b-0 md:border-r-2">
          <div className="upper">
            <h2 className='text-2xl poppins-semibold mt-6'>All Subjects From
              Class 1 to 8</h2>
          </div>
          <div className="lower flex justify-between">
            <div className="logo"><img src="src/assets/book-bulb.png" alt="" className='w-20'/></div>
            <i className="ri-arrow-right-up-line text-[#ff924e] text-6xl"></i>
          </div>
          </div>
          <div className="s-material-box md:w-1/4 pb-7 md:pb-0 px-3 flex flex-col gap-4 border-b-2 md:border-b-0 md:border-r-2">
          <div className="upper">
            <h2 className='text-2xl poppins-semibold mt-6'>Physics, Chemsitry and Maths for Class 9 and 10 </h2>
          </div>
          <div className="lower flex justify-between">
            <div className="logo"><img src="src/assets/globe.png" alt="" className='w-20'/></div>
            <i className="ri-arrow-right-up-line text-[#ff924e] text-6xl"></i>
          </div>
          </div>
          <div className="s-material-box md:w-1/4 pb-7 md:pb-0 px-3 flex flex-col gap-4 border-b-2 md:border-b-0 md:border-r-2">
          <div className="upper">
            <h2 className='text-2xl poppins-semibold mt-6'>Learn Programming with Python </h2>
          </div>
          <div className="lower flex justify-between">
            <div className="logo"><img src="src/assets/sand-clock.png" alt="" className='w-20'/></div>
            <i className="ri-arrow-right-up-line text-[#ff924e] text-6xl"></i>
          </div>
          </div>

        </div>

      </div>
    </>
  )
}

export default Home