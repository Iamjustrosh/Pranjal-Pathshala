import React from 'react'
import Hero from '../components/Hero'
import star from '../assets/star.png'
import bookbulb from '../assets/book-bulb.png'
import globe from '../assets/globe.png'
import sandclock from '../assets/sand-clock.png'
import goodies from '../assets/goodies.png'
import getInTouch from '../assets/getInTouch.png'
import Testimonial from '../components/Testimonial'
import { Link } from 'react-router-dom'



const Home = () => {
  return (
    <>
      <div className='px-5'>
        <Hero />

        <div className="section-3 relative ">
          <h1 className='text-5xl poppins-bold leading-tight'>Simplified <span className='text-[#FF914D]'>Learning</span> <br /> from Basics to <span className='text-[#FF914D]'>Brilliance</span></h1>

          <div className='s-materials flex flex-col md:flex-row gap-7 mt-2 '>
            <div className="s-material-box flex-1 md:w-1/4 pb-7 md:pb-0 px-3 flex flex-col justify-between gap-4 border-b-2 md:border-b-0 md:border-r-2">
              <div className="upper">
                <h2 className='text-2xl poppins-semibold mt-6'>All Subjects From
                  Class 1 to 8</h2>
              </div>
              <div className="lower flex justify-between">
                <div className="logo"><img src={bookbulb} alt="bookBulb" className='w-20' /></div>
                <i className="ri-arrow-right-up-line text-[#FF914D] text-6xl"></i>
              </div>
            </div>
            <div className="s-material-box flex-1 md:w-1/4 pb-7 md:pb-0 px-3 flex flex-col justify-between gap-4 border-b-2 md:border-b-0 md:border-r-2">
              <div className="upper">
                <h2 className='text-2xl poppins-semibold mt-6'>Physics, Chemsitry and Maths for Class 9 and 10 </h2>
              </div>
              <div className="lower flex justify-between">
                <div className="logo"><img src={globe} alt="" className='w-20' /></div>
                <i className="ri-arrow-right-up-line text-[#FF914D] text-6xl"></i>
              </div>
            </div>
            <div className="s-material-box flex-1 md:w-1/4 pb-7 md:pb-0 px-3 flex flex-col justify-between gap-4 border-b-2 md:border-b-0 md:border-r-2">
              <div className="upper">
                <h2 className='text-2xl poppins-semibold mt-6'>Learn Programming with Python </h2>
              </div>
              <div className="lower flex justify-between">
                <div className="logo"><img src={sandclock} alt="" className='w-20' /></div>
                <i className="ri-arrow-right-up-line text-[#FF914D] text-6xl"></i>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Link to="/study-material">
              <button className="mt-5 mb-4 px-6 py-3 text-center bg-[#FF914D] text-white text-lg font-semibold rounded-xl hover:bg-[#e38a53] transition duration-300">
                Get Study Material
              </button>
            </Link>
          </div>

        </div>
        <div className="section-2 mb-4 mt-4">
          <img src={goodies} alt="" className='w-full' />
        </div>
        <div className="section-4">
          <div className="heading-section-3 mt-4">
            <h1 className='text-5xl poppins-bold'>What our <span className='text-[#FF914D]'>Students</span> &</h1>
            <div className='flex items-center md:gap-4'>
              <h1 className='text-5xl poppins-bold'><span className='text-[#FF914D]'>Parents </span> Say</h1>
              <img src={star} alt="star" className="w-14" />
            </div>
          </div>
          <Testimonial />
        </div>
        <div className="section-5">
          <div className="map-container flex justify-center items-center w-full  h-[450px] my-6">
            <iframe className='md:w-[60%] w-full'
              title="Pranjal Pathshala Location"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d453.62062342303767!2d80.82440947531917!3d24.55587201098655!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39847fa29e0df0b1%3A0xb3ff3cb7b79fa546!2sPranjal%20Pathshala!5e0!3m2!1sen!2sin!4v1759336216112!5m2!1sen!2sin" 
              // width="60%"
              height="100%"
              style={{ border: 0 }} 
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </>
  )
}



export default Home