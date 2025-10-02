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
    <div className="flex flex-col md:flex-row w-full items-stretch justify-center bg-gray-50 py-8 px-4">
      {/* Left: Contact Form */}
      <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-6 md:mr-4 mb-6 md:mb-0 flex flex-col flex-1">
        <h2 className="text-2xl poppins-bold mb-4 flex items-center gap-2">
        Contact Us
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-grow">
          <div>
            <label className="block text-sm poppins-medium mb-1" htmlFor="name">
              Name
            </label>
            <div className="flex items-center border rounded px-2">
              <i className="ri-user-line text-gray-400 mr-2"></i>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full py-2 outline-none bg-transparent"
                placeholder="Your Name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm poppins-medium mb-1" htmlFor="phone">
              Phone
            </label>
            <div className="flex items-center border rounded px-2">
              <i className="ri-phone-line text-gray-400 mr-2"></i>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full py-2 outline-none bg-transparent"
                placeholder="Your Phone Number"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={15}
                autoComplete="off"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm poppins-medium mb-1" htmlFor="message">
              Message
            </label>
            <div className="flex items-start border rounded px-2">
              <i className="ri-message-2-line text-gray-400 mr-2 mt-2"></i>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                className="w-full py-2 outline-none bg-transparent resize-none"
                placeholder="Your Message"
                rows={4}
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white poppins-semibold py-2 rounded hover:bg-blue-700 transition"
          >
            Send Message
          </button>
        </form>
      </div>

      {/* Right: Contact Details */}
      <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-6 flex flex-col items-start flex-1">
        <h2 className="text-2xl poppins-bold mb-4 flex items-center gap-2">
          My Details
        </h2>
        <div className="flex items-center mb-3 text-lg">
          <i className="ri-mail-line mr-3"></i>
          <span className="poppins-medium">pranjaljain2422@gmail.com</span>
        </div>
        <div className="flex items-center mb-3 text-lg">
          <i className="ri-phone-line mr-3"></i>
          <span className="poppins-medium">+91 94794 80495</span>
        </div>
        <div className="flex items-center mb-3 text-lg">
          <i className="ri-map-pin-line mr-3"></i>
          <span className="poppins-medium">
          Near Kapoor Bangla, Premnagar, Satna, M.P. 485001
          </span>
        </div>
        <div className="flex items-center mt-4">
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
  );
};

export default Contact;