import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const generatePDF = (formData) => {
  const input = document.getElementById("pdf-template");
  if (!input) return;

  // Temporarily show the hidden element
  input.style.display = "block";

  html2canvas(input, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
  })
    .then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.student_name}_Admission.pdf`);
    })
    .catch((err) => console.error("Error generating PDF:", err))
    .finally(() => {
      // Hide it again
      input.style.display = "none";
    });
};



const input =
  "w-full border border-gray-300 rounded-md p-2 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-blue-400";

const sectionHeading =
  "text-xl font-semibold mb-3 border-b pb-2 bg-[#182B5C] text-white px-3 py-2 rounded-md";

const sectionBox =
  "mb-8 bg-gray-50 rounded-lg shadow-sm p-4 md:p-6 border-2 border-[#317B74]";

const emailPattern =
  "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"; // Simple email regex

// Changed pattern to any 10 digits (first digit can be anything)
const phonePattern = "^[0-9]{10}$"; // Any 10 digit mobile number

const NewAdmissionForm = () => {
  const [formData, setFormData] = useState({
    student_name: "",
    father_name: "",
    mother_name: "",
    dob: "",
    gender: "",
    contact_number: "",
    parent_contact_number: "",
    email: "",
    address: "",
    class: "",
    school_name: "",
    board: "",
    interested_subjects: [],
    studied_with_us: "",
    session: "",
    referral_source: "",
    additional_notes: "",
    photo_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // --- Dropdown data ---
  const classOptions = [
    "Class 1",
    "Class 2",
    "Class 3",
    "Class 4",
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",
  ];

  const subjectOptions = ["Math", "Science", "English", "Social Studies", "Computer"];

  const boardOptions = ["CBSE", "ICSE", "State Board", "Other"];

  const referralOptions = [
    "Friends/Family",
    "Social Media",
    "School",
    "Advertisement",
    "Other",
  ];

  // --- Handle input change ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate field in real time for phone/email
    setFormErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (name === "contact_number" || name === "parent_contact_number") {
        if (value && !new RegExp(phonePattern).test(value)) {
          newErrors[name] = "Please enter a valid 10-digit mobile number.";
        } else {
          delete newErrors[name];
        }
      } else if (name === "email") {
        if (value && !new RegExp(emailPattern).test(value)) {
          newErrors[name] = "Please enter a valid email address.";
        } else {
          delete newErrors[name];
        }
      }
      return newErrors;
    });
  };

  // --- Handle multiple subject checkbox selection ---
  const handleSubjectChange = (subject) => {
    setFormData((prev) => {
      const updatedSubjects = prev.interested_subjects.includes(subject)
        ? prev.interested_subjects.filter((s) => s !== subject)
        : [...prev.interested_subjects, subject];
      return { ...prev, interested_subjects: updatedSubjects };
    });
  };

  // --- Handle photo upload ---
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    setUploadError("");
    if (!file) return;
    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `student_${Date.now()}.${fileExt}`;
      const filePath = `photos/${fileName}`;
      let { data, error: uploadError } = await supabase.storage
        .from("student-photos")
        .upload(filePath, file);

      if (uploadError) {
        setUploadError("Error uploading image. Please try again.");
        setUploading(false);
        setFormData(prev => ({ ...prev, photo_url: "" }));
        setPreviewUrl("");
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("student-photos")
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, photo_url: publicUrl }));
      setPreviewUrl(URL.createObjectURL(file));
    } catch (err) {
      setUploadError("Error uploading image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // --- Submit form to Supabase ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setFormErrors({}); // clear previous errors

    // Manual validation before submit
    let errors = {};

    // Validate contact_number
    if (!formData.contact_number || !new RegExp(phonePattern).test(formData.contact_number)) {
      errors.contact_number =
        "Please enter a valid 10-digit mobile number.";
    }
    // Validate parent_contact_number
    if (
      !formData.parent_contact_number ||
      !new RegExp(phonePattern).test(formData.parent_contact_number)
    ) {
      errors.parent_contact_number =
        "Please enter a valid 10-digit mobile number.";
    }
    // Validate email (if provided)
    if (
      formData.email &&
      !new RegExp(emailPattern).test(formData.email)
    ) {
      errors.email = "Please enter a valid email address.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setMessage("❌ Please fix the errors before submitting the form.");
      setLoading(false);
      return;
    }

    // Insert data into Supabase
    const { data, error } = await supabase.from("students").insert([
      {
        ...formData,
        interested_subjects: formData.interested_subjects, // array format
      },
    ]);

    if (error) {
      console.error(error);
      setMessage("❌ Error submitting form. Please try again.");
    } else {
      setMessage("✅ Form submitted successfully!");
      generatePDF(formData);
      // reset form
      setFormData({
        student_name: "",
        father_name: "",
        mother_name: "",
        dob: "",
        gender: "",
        contact_number: "",
        parent_contact_number: "",
        email: "",
        address: "",
        class: "",
        school_name: "",
        board: "",
        interested_subjects: [],
        studied_with_us: "",
        session: "",
        referral_source: "",
        additional_notes: "",
        photo_url: "",
      });
      setPreviewUrl("");
      setFormErrors({});
    }

    setLoading(false);
  };

  return (
    <div className="w-full mx-auto my-10 p-6 bg-white rounded-2xl">
      <h2 className="text-2xl font-bold text-center mb-6 text-[#317B74]">
        Admission Form
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* PERSONAL INFORMATION */}
        <section className={sectionBox}>
          <h3 className={sectionHeading}>Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="student_name" className="block text-gray-700 font-medium mb-1">
                Student Name<span className="text-red-500">*</span>
              </label>
              <input
                id="student_name"
                name="student_name"
                value={formData.student_name}
                onChange={handleChange}
                className={input}
                required
              />
            </div>
            <div>
              <label htmlFor="father_name" className="block text-gray-700 font-medium mb-1">
                Father's Name<span className="text-red-500">*</span>
              </label>
              <input
                id="father_name"
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
                className={input}
                required
              />
            </div>
            <div>
              <label htmlFor="mother_name" className="block text-gray-700 font-medium mb-1">
                Mother's Name
              </label>
              <input
                id="mother_name"
                name="mother_name"
                value={formData.mother_name}
                onChange={handleChange}
                className={input}
              />
            </div>
            <div>
              <label htmlFor="dob" className="block text-gray-700 font-medium mb-1">
                Date of Birth<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={input}
                required
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-gray-700 font-medium mb-1">
                Gender<span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={input}
                required
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="contact_number" className="block text-gray-700 font-medium mb-1">
                Student Contact Number<span className="text-red-500">*</span>
              </label>
              <input
                id="contact_number"
                name="contact_number"
                type="tel"
                value={formData.contact_number}
                onChange={handleChange}
                pattern={phonePattern}
                maxLength={10}
                minLength={10}
                className={input}
                autoComplete="tel"
                required
                inputMode="numeric"
              />
              {formErrors.contact_number && (
                <span className="text-red-600 text-xs">{formErrors.contact_number}</span>
              )}
            </div>
            <div>
              <label htmlFor="parent_contact_number" className="block text-gray-700 font-medium mb-1">
                Parent Contact Number<span className="text-red-500">*</span>
              </label>
              <input
                id="parent_contact_number"
                name="parent_contact_number"
                type="tel"
                value={formData.parent_contact_number}
                onChange={handleChange}
                pattern={phonePattern}
                maxLength={10}
                minLength={10}
                className={input}
                autoComplete="tel"
                required
                inputMode="numeric"
              />
              {formErrors.parent_contact_number && (
                <span className="text-red-600 text-xs">{formErrors.parent_contact_number}</span>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                Email / Parent Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={input}
                pattern={emailPattern}
                autoComplete="email"
              />
              {formErrors.email && (
                <span className="text-red-600 text-xs">{formErrors.email}</span>
              )}
            </div>
            {/* Upload Student Photo */}
            <div className="md:col-span-2 col-span-1">
              <label className="block text-gray-700 font-medium mb-1" htmlFor="photo">
                Student Photo (Upload image in white background)
              </label>
              <input
                type="file"
                accept="image/*"
                id="photo"
                name="photo"
                onChange={handlePhotoUpload}
                className={input}
                disabled={uploading}
              />
              {uploading && <div className="text-blue-600 text-sm mt-1">Uploading...</div>}
              {uploadError && <div className="text-red-600 text-sm mt-1">{uploadError}</div>}
              {previewUrl && (
                <div className="mt-2">
                  <img
                    src={previewUrl}
                    alt="Student preview"
                    className="max-h-24 rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mt-3">
            <label htmlFor="address" className="block text-gray-700 font-medium mb-1">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`${input} w-full`}
              rows={2}
            ></textarea>
          </div>
        </section>

        {/* ACADEMIC DETAILS */}
        <section className={sectionBox}>
          <h3 className={sectionHeading}>Academic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="class" className="block text-gray-700 font-medium mb-1">
                Class<span className="text-red-500">*</span>
              </label>
              <select
                id="class"
                name="class"
                value={formData.class}
                onChange={handleChange}
                className={input}
                required
              >
                <option value="">Select Class</option>
                {classOptions.map((cls) => (
                  <option key={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="school_name" className="block text-gray-700 font-medium mb-1">
                School Name
              </label>
              <input
                id="school_name"
                name="school_name"
                value={formData.school_name}
                onChange={handleChange}
                className={input}
              />
            </div>

            <div>
              <label htmlFor="board" className="block text-gray-700 font-medium mb-1">
                Board
              </label>
              <select
                id="board"
                name="board"
                value={formData.board}
                onChange={handleChange}
                className={input}
              >
                <option value="">Select Board</option>
                {boardOptions.map((board) => (
                  <option key={board}>{board}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interested Subjects */}
          <div className="mt-3">
            <p className="font-medium mb-2">Interested Subjects</p>
            <div className="flex flex-wrap gap-4">
              {subjectOptions.map((subject) => (
                <label key={subject} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.interested_subjects.includes(subject)}
                    onChange={() => handleSubjectChange(subject)}
                    className="outline-1 outline-gray-300 focus:outline-2 focus:outline-blue-400"
                  />
                  {subject}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* PAST EXPERIENCE */}
        <section className={sectionBox}>
          <h3 className={sectionHeading}>Past Experience</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="studied_with_us" className="block text-gray-700 font-medium mb-1">
                Have you studied with us before?
              </label>
              <select
                id="studied_with_us"
                name="studied_with_us"
                value={formData.studied_with_us}
                onChange={handleChange}
                className={input}
              >
                <option value="">Have you studied with us before?</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div>
              <label htmlFor="session" className="block text-gray-700 font-medium mb-1">
                Year / Session
              </label>
              <input
                id="session"
                name="session"
                value={formData.session}
                onChange={handleChange}
                className={input}
              />
            </div>
          </div>
        </section>

        {/* OPTIONAL */}
        <section className={sectionBox}>
          <h3 className={sectionHeading}>Optional Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="referral_source" className="block text-gray-700 font-medium mb-1">
                How did you hear about us?
              </label>
              <select
                id="referral_source"
                name="referral_source"
                value={formData.referral_source}
                onChange={handleChange}
                className={input}
              >
                <option value="">How did you hear about us?</option>
                {referralOptions.map((source) => (
                  <option key={source}>{source}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="additional_notes" className="block text-gray-700 font-medium mb-1">
                Any question or requirement?
              </label>
              <textarea
                id="additional_notes"
                name="additional_notes"
                value={formData.additional_notes}
                onChange={handleChange}
                className={`${input} w-full`}
                rows={3}
              ></textarea>
            </div>
          </div>
        </section>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FF914D] text-white py-3 rounded-lg hover:bg-[#FFb14D] transition"
        >
          {loading ? "Submitting..." : "Submit Admission Form"}
        </button>

        {message && <p className="text-center mt-4 font-medium">{message}</p>}
      </form>


      {/* Hidden PDF template for PDF generation */}
      <div
        id="pdf-template"
        className="w-[800px] bg-white text-gray-800 font-sans relative overflow-hidden"
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: 900,
        }}
      >
        {/* Watermark with logo */}
        <img
          src="/logo.png"
          alt="Pranjal Pathshala Logo Watermark"
          style={{
            position: "absolute",
            left: "50%",
            top: "48%",
            transform: "translate(-50%, -50%)",
            zIndex: 0,
            opacity: 0.17, // Slight increased opacity for watermark
            width: "400px",
            height: "400px",
            objectFit: "contain",
            pointerEvents: "none",
            userSelect: "none",
          }}
          crossOrigin="anonymous"
        />

        {/* Letterhead Box */}
        <div
          className="relative z-10 px-3 py-4 mb-2 bg-[#182B5C] text-[#FF914D]"
        >
          <div className="flex flex-col items-start">
            <span className="text-4xl font-extrabold tracking-wide mb-2">
              Pranjal Pathshala
            </span>
            <div className="flex flex-col items-start gap-1 mt-1 text-base">
              <div className="flex items-center gap-2">
                <i className="ri-mail-line text-lg mr-1" /> pranjaljain2422@gmail.com
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-phone-line text-lg mr-1" /> +91 94794 80495
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-map-pin-line text-lg mr-1" /> Near Kapoor Bangla, Premnagar, Satna, M.P. 485001
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="mb-4 relative px-3 z-10">
          <h2
            className="text-xl font-bold mb-2 py-2 text-left"
            style={{ borderBottom: "2px solid #182B5C" }}
          >
            Personal Details
          </h2>
          <div className="grid grid-cols-2">
            <div>
              <p>
                <span className="font-semibold">Name:</span> {formData.student_name}
              </p>
              <p>
                <span className="font-semibold">Father's Name:</span> {formData.father_name}
              </p>
              <p>
                <span className="font-semibold">Mother's Name:</span> {formData.mother_name}
              </p>
              <p>
                <span className="font-semibold">DOB:</span> {formData.dob}
              </p>
              <p>
                <span className="font-semibold">Gender:</span> {formData.gender}
              </p>
            </div>
            <div className="flex justify-end items-start">
              {/* Student Photo */}
              {formData.photo_url && (
                <div>
                  <img
                    src={formData.photo_url}
                    alt="Student Photo"
                    className="h-24 w-24 object-cover rounded-lg border"
                    crossOrigin="anonymous"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4 relative px-3 z-10">
          <h2
            className="text-xl font-bold mb-2 py-2 text-left"
            style={{ borderBottom: "2px solid #182B5C" }}
          >
            Contact Details
          </h2>
          <p>
            <span className="font-semibold">Student Contact:</span> {formData.contact_number}
          </p>
          <p>
            <span className="font-semibold">Parent Contact:</span> {formData.parent_contact_number}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {formData.email}
          </p>
          <p>
            <span className="font-semibold">Address:</span> {formData.address}
          </p>
        </div>

        <div className="mb-4 relative px-3 z-10">
          <h2
            className="text-xl font-bold mb-2 py-2 text-left"
            style={{ borderBottom: "2px solid #182B5C" }}
          >
            Academic Details
          </h2>
          <p>
            <span className="font-semibold">Class:</span> {formData.class}
          </p>
          <p>
            <span className="font-semibold">School Name:</span> {formData.school_name}
          </p>
          <p>
            <span className="font-semibold">Board:</span> {formData.board}
          </p>
          <p>
            <span className="font-semibold">Interested Subjects:</span> {formData.interested_subjects.join(", ")}
          </p>
        </div>

        <div className="mb-4 relative px-3 z-10">
          <h2
            className="text-xl font-bold mb-2 py-2 text-left"
            style={{ borderBottom: "2px solid #182B5C" }}
          >
            Other Details
          </h2>
          <p>
            <span className="font-semibold">Previously Studied With Us:</span> {formData.studied_with_us}
          </p>
          <p>
            <span className="font-semibold">Session:</span> {formData.session}
          </p>
          <p>
            <span className="font-semibold">Referral Source:</span> {formData.referral_source}
          </p>
          <p>
            <span className="font-semibold">Additional Notes:</span> {formData.additional_notes}
          </p>
        </div>
      </div>

    </div>
  );
};

export default NewAdmissionForm;
