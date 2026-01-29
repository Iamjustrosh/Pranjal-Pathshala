import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const input =
  "w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white/90 text-slate-800 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent";

const sectionHeading =
  "text-lg md:text-xl poppins-semibold mb-4 text-slate-900 flex items-center gap-2";

const sectionBox =
  "mb-8 bg-white/95 rounded-3xl shadow-[0_18px_55px_rgba(148,163,184,0.30)] p-4 md:p-6 border border-blue-100/80";

const emailPattern =
  "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"; // Simple email regex

// Changed pattern to any 10 digits (first digit can be anything)
const phonePattern = "^[0-9]{10}$"; // Any 10 digit mobile number

const LOCALSTORAGE_KEY = "newAdmissionFormData";
const CONSENT_KEY = "newAdmissionFormConsent";

const initialFormState = {
  student_name: "",
  father_name: "",
  mother_name: "",
  father_occupation: "",
  mother_occupation: "",
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
};

const NewAdmissionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [consentAccepted, setConsentAccepted] = useState(false);

  // --- Restore data from localStorage, only run on mount ---
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALSTORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed) {
        // If interested_subjects is not an array (bad parse), fallback to []
        setFormData({
          ...initialFormState,
          ...parsed,
          interested_subjects: Array.isArray(parsed.interested_subjects)
            ? parsed.interested_subjects
            : [],
        });
        // Handle photo preview for persisted photo_url (local preview unavailable)
      }
    } catch (e) {
      // Just ignore malformed localstorage
      console.error("Error loading formData from localStorage", e);
    }
    // Restore consent checkbox state too
    const consentStored = localStorage.getItem(CONSENT_KEY);
    if (consentStored === "true") {
      setConsentAccepted(true);
    }
  }, []);

  // --- Persist formData to localStorage ---
  useEffect(() => {
    // Don't store if form is pristine to avoid storing empty object
    if (
      Object.values(formData).some(
        (v) => v !== "" && !(Array.isArray(v) && v.length === 0)
      )
    ) {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  // --- Persist consent to localStorage ---
  useEffect(() => {
    localStorage.setItem(CONSENT_KEY, consentAccepted ? "true" : "false");
  }, [consentAccepted]);

  // --- Dropdown data ---
  const classOptions = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
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
    setFormData((prev) => ({ ...prev, [name]: value }));

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
        setFormData((prev) => ({ ...prev, photo_url: "" }));
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

    if (!consentAccepted) {
      setMessage("❌ Please accept the consent to proceed.");
      setLoading(false);
      return;
    }

    // Manual validation before submit
    let errors = {};
    if (!formData.contact_number || !new RegExp(phonePattern).test(formData.contact_number)) {
      errors.contact_number =
        "Please enter a valid 10-digit mobile number.";
    }
    if (
      !formData.parent_contact_number ||
      !new RegExp(phonePattern).test(formData.parent_contact_number)
    ) {
      errors.parent_contact_number =
        "Please enter a valid 10-digit mobile number.";
    }
    if (
      formData.email &&
      !new RegExp(emailPattern).test(formData.email)
    ) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.photo_url) {
      errors.photo_url = "Please upload the student's photo.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setMessage("❌ Please fix the errors before submitting the form.");
      setLoading(false);
      return;
    }

    // Insert to Supabase
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
      // Clear localStorage on successful submit
      localStorage.removeItem(LOCALSTORAGE_KEY);
      localStorage.removeItem(CONSENT_KEY);

      navigate("/admission-pdf", { state: { formData } });
      setFormData(initialFormState);
      setPreviewUrl("");
      setFormErrors({});
    }

    setLoading(false);
  };

  return (
    <section className="min-h-[80vh] r px-4 py-10 md:py-14">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-10 space-y-2">
          <p className="text-xs md:text-sm uppercase tracking-[0.24em] text-slate-500 poppins-medium">
            Detailed Admission Form
          </p>
          <h2 className="text-3xl md:text-4xl poppins-bold text-slate-900">
            New <span className="text-[#3B82F6]">Admission</span>
          </h2>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            Kripya form ko dhyaan se aur sahi jankari ke saath bharein. Ye details aapke admission
            process ko smooth banane mein madad karti hain.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* PERSONAL INFORMATION */}
        <section className={sectionBox}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={sectionHeading}>Personal Information</h3>
            <span className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-slate-400">
              Student Details
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
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
              <label htmlFor="contact_number" className="block text-gray-700 font-medium mb-1">
                Whatsapp Number<span className="text-red-500">*</span>
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
            {/* Upload Student Photo */}
            <div className="col-span-1">
              <label className="block text-gray-700 font-medium mb-1" htmlFor="photo">
                Student Photo (Upload image in white background)<span className="text-red-500">*</span>
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
              {!uploading && formErrors.photo_url && (
                <div className="text-red-600 text-sm mt-1">{formErrors.photo_url}</div>
              )}
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
            <div>
              <label htmlFor="school_name" className="block text-gray-700 font-medium mb-1">
                School Name<span className="text-red-500">*</span>
              </label>
              <input
                id="school_name"
                name="school_name"
                value={formData.school_name}
                onChange={handleChange}
                className={input}
                required
              />
            </div>

            <div>
              <label htmlFor="board" className="block text-gray-700 font-medium mb-1">
                Board<span className="text-red-500">*</span>
              </label>
              <select
                id="board"
                name="board"
                value={formData.board}
                onChange={handleChange}
                className={input}
                required
              >
                <option value="">Select Board</option>
                {boardOptions.map((board) => (
                  <option key={board}>{board}</option>
                ))}
              </select>
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
            <div>
              <label htmlFor="address" className="block text-gray-700 font-medium mb-1">
                Address<span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`${input} w-full`}
                rows={2}
                required
              ></textarea>
            </div>
          </div>
        </section>
        {/* PARENTAL DETAILS */}
        <section className={sectionBox}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={sectionHeading}>Parental Details</h3>
            <span className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-slate-400">
              Guardian Information
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
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
              <label htmlFor="father_occupation" className="block text-gray-700 font-medium mb-1">
                Father's Occupation<span className="text-red-500">*</span>
              </label>
              <input
                id="father_occupation"
                name="father_occupation"
                value={formData.father_occupation}
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
              <label htmlFor="father_occupation" className="block text-gray-700 font-medium mb-1">
                Mother's Occupation
              </label>
              <input
                id="mother_occupation"
                name="mother_occupation"
                value={formData.mother_occupation}
                onChange={handleChange}
                className={input}
              />
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
                Email<span className="text-red-500">*</span>
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
                required
              />
              {formErrors.email && (
                <span className="text-red-600 text-xs">{formErrors.email}</span>
              )}
            </div>
          </div>
        </section>
        {/* PAST EXPERIENCE */}
        <section className={sectionBox}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={sectionHeading}>Past Experience</h3>
            <span className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-slate-400">
              Previous Association
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
            <div>
              <label htmlFor="studied_with_us" className="block text-gray-700 font-medium mb-1">
                Have you studied with us before?<span className="text-red-500">*</span>
              </label>
              <select
                id="studied_with_us"
                name="studied_with_us"
                value={formData.studied_with_us}
                onChange={handleChange}
                className={input}
                required
              >
                <option value="">Have you studied with us before?</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div>
              <label htmlFor="session" className="block text-gray-700 font-medium mb-1">
                Year
              </label>
              <input
                type="number"
                id="session"
                name="session"
                value={formData.session}
                onChange={handleChange}
                className={input}
                min="1900"
                max="2100"
                step="1"
                placeholder="e.g. 2024"
                pattern="\d{4}"
              />
            </div>
          </div>
        </section>
        {/* OPTIONAL */}
        <section className={sectionBox}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={sectionHeading}>Optional Information</h3>
            <span className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-slate-400">
              Extra Details
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="referral_source" className="block text-gray-700 font-medium mb-1">
                How did you hear about us?<span className="text-red-500">*</span>
              </label>
              <select
                id="referral_source"
                name="referral_source"
                value={formData.referral_source}
                onChange={handleChange}
                className={input}
                required
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
        {/* CONSENT */}
        <div className="flex items-start gap-3 bg-[#EFF6FF] border border-blue-100 rounded-xl p-3 md:p-4">
          <input
            id="consent"
            type="checkbox"
            checked={consentAccepted}
            onChange={(e) => setConsentAccepted(e.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <label htmlFor="consent" className="text-sm text-gray-700">
            I hereby declare that the information provided is accurate to the best of my knowledge and I consent to its use for admission-related processes.
          </label>
        </div>
        {/* SUBMIT */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !consentAccepted}
            className={`w-full md:w-56 px-4 py-3 rounded-xl text-sm md:text-base poppins-semibold text-white transition-all duration-200 shadow-[0_18px_45px_rgba(96,165,250,0.65)] ${
              loading || !consentAccepted
                ? "bg-slate-300 cursor-not-allowed shadow-none"
                : "bg-[#60A5FA] hover:bg-[#3B82F6] hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            {loading ? "Submitting..." : "Submit & Generate PDF"}
          </button>

          {message && (
            <p className="text-center mt-1 text-sm md:text-base font-medium text-slate-700">
              {message}
            </p>
          )}
        </div>
      </form>
      </div>
    </section>
  );
};

export default NewAdmissionForm;
