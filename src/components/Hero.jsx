import React from 'react';
import heroBag from '../assets/hero_bag.png';
import heroImage from '../assets/hero.png';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between py-10 md:h-2/5">

      <div className="w-full md:w-1/2 space-y-6">

        <div>
          <h1 className="text-5xl md:text-6xl font-bold font-poppins flex items-center gap-2">
            Aapka Safar,
            <img src={heroBag} alt="hero-bag" className="w-14 md:w-20 h-auto inline-block" />
          </h1>
          <h1 className="text-5xl md:text-6xl font-bold font-poppins mt-2">
            Humhari Zimmedari!
          </h1>
        </div>

        <p className="text-lg md:text-xl font-poppins w-3/4">
          Pranjal Pathshala ek vishwasniya aur result-oriented coaching institute hai, jo students ke academic goals ko pura karne mein madad karta hai.
        </p>

        <Link to="/admission" className="text-xl font-bold text-blue-600">
        <button className="mt-4 px-6 py-3 bg-[#ff924e] text-white text-lg font-semibold rounded-xl hover:bg-[#e38a53] transition duration-300">
          Start Today
        </button>
        </Link>
        <p className="px-2">
          All Subjects | CBSE & State Board
        </p>
      </div>

      <div className="w-full md:w-1/2 hidden md:block -mr-24">
        <img src={heroImage} alt="hero" className="w-3/4 h-auto" />
      </div>
    </div>
  );
};

export default Hero;
