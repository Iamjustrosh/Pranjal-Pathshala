import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";





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
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [consentAccepted, setConsentAccepted] = useState(false);

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

    // Require consent before submission
    if (!consentAccepted) {
      setMessage("❌ Please accept the consent to proceed.");
      setLoading(false);
      return;
    }

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

    // Require student photo
    if (!formData.photo_url) {
      errors.photo_url = "Please upload the student's photo.";
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
      navigate("/admission-pdf", { state: { formData } });
      // reset form
      setFormData({
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
                required
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
          <h3 className={sectionHeading}>Parental Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <h3 className={sectionHeading}>Past Experience</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <h3 className={sectionHeading}>Optional Information</h3>
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
        <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-md p-3">
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
        <button
          type="submit"
          disabled={loading || !consentAccepted}
          className="w-xs bg-[#FF914D] text-white px-2 py-3 rounded-lg hover:bg-[#FFb14D] transition"
        >
          {loading ? "Submitting..." : "Submit "}
        </button>

        {message && <p className="text-center mt-4 font-medium">{message}</p>}
      </form>




    </div>
  );
};

export default NewAdmissionForm;
