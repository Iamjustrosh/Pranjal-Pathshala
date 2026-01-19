import React, { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    message: '',
  });

  // Only allow numeric input in phone field (prevents alphabet entry)
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Only update if value is empty or all digits
      if (value === '' || /^[0-9]+$/.test(value)) {
        setForm({ ...form, [name]: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can add form submission logic here (e.g., send to backend or show a toast)
    alert('Thank you for contacting us!');
    setForm({ name: '', phone: '', message: '' });
  };

  return (
    <section className="w-full bg-gradient-to-b from-[#EEF2FF] via-white to-[#E0F2FE] py-10 md:py-14 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-10 space-y-2">
          <p className="text-xs md:text-sm uppercase tracking-[0.24em] text-slate-500 poppins-medium">
            We’re Here To Help
          </p>
          <h1 className="text-3xl md:text-4xl poppins-bold text-slate-900">
            Contact <span className="text-[#3B82F6]">Pranjal Pathshala</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            Admission, timings, ya kisi bhi doubt ke liye hume message karein. Hum jaldi hi aap se
            contact karenge.
          </p>
        </div>

        <div className="flex flex-col md:flex-row w-full items-stretch justify-center gap-6">
          {/* Left: Contact Form */}
          <div className="w-full md:w-1/2 bg-white/95 rounded-3xl shadow-[0_22px_70px_rgba(148,163,184,0.35)] p-6 md:p-7 border border-blue-100/70 flex flex-col flex-1">
            <h2 className="text-2xl poppins-bold mb-4 flex items-center gap-2 text-slate-900">
              Contact Us
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-grow">
              <div>
                <label className="block text-sm poppins-medium mb-1 text-slate-700" htmlFor="name">
                  Name
                </label>
                <div className="flex items-center border border-slate-200 rounded-xl px-2 bg-slate-50/60 focus-within:ring-2 focus-within:ring-[#60A5FA]">
                  <i className="ri-user-line text-gray-400 mr-2"></i>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full py-2 outline-none bg-transparent text-slate-800 text-sm md:text-base"
                    placeholder="Your Name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm poppins-medium mb-1 text-slate-700" htmlFor="phone">
                  Phone
                </label>
                <div className="flex items-center border border-slate-200 rounded-xl px-2 bg-slate-50/60 focus-within:ring-2 focus-within:ring-[#60A5FA]">
                  <i className="ri-phone-line text-gray-400 mr-2"></i>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full py-2 outline-none bg-transparent text-slate-800 text-sm md:text-base"
                    placeholder="Your Phone Number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={15}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm poppins-medium mb-1 text-slate-700" htmlFor="message">
                  Message
                </label>
                <div className="flex items-start border border-slate-200 rounded-xl px-2 bg-slate-50/60 focus-within:ring-2 focus-within:ring-[#60A5FA]">
                  <i className="ri-message-2-line text-gray-400 mr-2 mt-2"></i>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    className="w-full py-2 outline-none bg-transparent resize-none text-slate-800 text-sm md:text-base"
                    placeholder="Your Message"
                    rows={4}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-[#60A5FA] text-white poppins-semibold py-2.5 rounded-xl text-sm md:text-base hover:bg-[#3B82F6] transition shadow-[0_16px_40px_rgba(96,165,250,0.55)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Right: Contact Details */}
          <div className="w-full md:w-1/2 bg-white/95 rounded-3xl shadow-[0_22px_70px_rgba(148,163,184,0.35)] p-6 md:p-7 flex flex-col items-start flex-1 border border-blue-100/70">
            <h2 className="text-2xl poppins-bold mb-4 flex items-center gap-2 text-slate-900">
              My Details
            </h2>
            <div className="space-y-3 w-full text-slate-800">
              <div className="flex items-center text-base md:text-lg">
                <i className="ri-mail-line mr-3 text-[#60A5FA]"></i>
                <span className="poppins-medium">pranjaljain2422@gmail.com</span>
              </div>
              <div className="flex items-center text-base md:text-lg">
                <i className="ri-phone-line mr-3 text-[#60A5FA]"></i>
                <span className="poppins-medium">+91 94794 80495</span>
              </div>
              <div className="flex items-start text-base md:text-lg">
                <i className="ri-map-pin-line mr-3 mt-1 text-[#60A5FA]"></i>
                <span className="poppins-medium">
                  Near Kapoor Bangla, Premnagar, Satna, M.P. 485001
                </span>
              </div>
            </div>
            <div className="flex items-center mt-5">
              <a
                href="https://wa.me/919479480495?text=Hello%21%20I%20need%20more%20information%20about%20your%20services"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-green-600 hover:underline text-lg"
              >
                <i className="ri-whatsapp-line text-2xl mr-2"></i>
                WhatsApp Me
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;