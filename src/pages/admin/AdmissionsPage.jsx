import { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { RiDeleteBinLine, RiCloseLine, RiEditLine } from "react-icons/ri";
import PageHeader from "@/components/admin/PageHeader";

export default function AdmissionsPage() {
  // --- DATA STATES ---
  const [admissionRequests, setAdmissionRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- EDIT MODES STATES ---
  const [selectedAdmission, setSelectedAdmission] = useState(null);

  const fetchAdmissionRequests = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("students")
        .select(
          `
        id,
        student_name,
        father_name,
        mother_name,
        dob,
        gender,
        contact_number,
        parent_contact_number,
        email,
        address,
        class,
        school_name,
        board,
        interested_subjects,
        status,
        photo_url,
        login_username,
        created_at
      `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAdmissionRequests(data || []);
    } catch (error) {
      console.error("Failed to fetch admission requests:", error);
      alert(error.message || "Failed to load admission requests.");
    } finally {
      setLoading(false);
    }
  };
  // --- ACTIONS: ADMISSIONS TAB ---
  const handleUpdateAdmission = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("students")
      .update({
        student_name: selectedAdmission.student_name,
        class: selectedAdmission.class,
        contact_number: selectedAdmission.contact_number,
        father_name: selectedAdmission.father_name,
        dob: selectedAdmission.dob,
        board: selectedAdmission.board,
        address: selectedAdmission.address,
        parent_contact_number: selectedAdmission.parent_contact_number,
        gender: selectedAdmission.gender,
      })
      .eq("id", selectedAdmission.id);

    if (error) alert(error.message);
    else {
      alert("Admission Details Updated!");
      setSelectedAdmission(null);
      fetchAdmissionRequests();
    }
  };

  const handleApproveAndEnroll = async (req) => {
    if (!window.confirm(`Enroll ${req.student_name}?`)) return;

    const currentYear = new Date().getFullYear();

    const academicYearInput = window.prompt(
      `Academic year for ${req.student_name}:`,
      String(currentYear),
    );

    if (academicYearInput === null) return;

    const academicYear = Number(academicYearInput);

    if (
      !Number.isInteger(academicYear) ||
      academicYear < 2000 ||
      academicYear > 2100
    ) {
      alert("Please enter a valid academic year.");
      return;
    }

    const password = String(req.contact_number ?? "").replace(/\D/g, "");
    if (password.length < 6) {
      alert(
        "Update the student contact number before enrolling (at least 6 digits required).",
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "enroll-student",
        {
          body: {
            studentId: req.id,
            academicYear,
            password,
          },
        },
      );

      if (error) {
        // functions.invoke may expose the useful response body
        // through the error context for non-2xx responses.
        let message = error.message || "Failed to enroll student";

        try {
          if (error.context) {
            const errorBody = await error.context.json();

            message = errorBody?.details || errorBody?.error || message;
          }
        } catch {
          // Keep original error message.
        }

        throw new Error(message);
      }

      if (!data?.success) {
        if (data?.partialSuccess) {
          console.error("Partial enrollment success:", data);

          alert(
            `Enrollment partially completed.\n\n` +
              `${data.error}\n\n` +
              `Do NOT try to enroll this student again until the database/Auth state is checked.`,
          );

          await fetchAdmissionRequests();
          return;
        }

        throw new Error(
          data?.details || data?.error || "Student enrollment failed",
        );
      }

      const enrollment = data.enrollment;

      alert(
        `Student enrolled successfully!\n\n` +
          `Login Username: ${enrollment.login_username}\n` +
          `Academic UID: ${enrollment.uid}\n` +
          `Academic Year: ${enrollment.academic_year}\n\n` +
          `Initial Password: ${password}`,
      );

      await fetchAdmissionRequests();
    } catch (error) {
      console.error("Enrollment failed:", error);

      alert(error.message || "Failed to enroll student.");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchEnroll = async () => {
    const pending = admissionRequests.filter((s) => s.status !== "enrolled");
    if (pending.length === 0) {
      alert("No pending students.");
      return;
    }
    if (!window.confirm(`Enroll ${pending.length} students?`)) return;

    setLoading(true);
    setLoading(false);
    alert("Batch function placeholder executed.");
  };

  const handleDeleteAdmission = async (id) => {
    if (!window.confirm("Permanently delete this admission inquiry?")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchAdmissionRequests();
  };

  useEffect(() => {
    fetchAdmissionRequests();
  }, []);

  return (
    <div>
      <PageHeader
        title="Admissions"
        description="Review admission requests and enroll students."
      />
      <div className="admin-module">
        {!selectedAdmission ? (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                New Admission Requests
              </h2>
              <button
                onClick={handleBatchEnroll}
                disabled
                className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-700 transition text-sm font-semibold flex items-center gap-2"
              >
                ⚡ Enroll All Pending
              </button>
            </div>
            {loading ? (
              <p role="status">Loading admission requests...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase">
                    <tr>
                      <th className="p-4">Photo</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Class</th>
                      <th className="p-4">Board</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!admissionRequests.length && (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-8 text-center text-slate-500"
                        >
                          No admission requests yet.
                        </td>
                      </tr>
                    )}
                    {admissionRequests.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50 transition cursor-pointer"
                        onClick={(e) => {
                          if (e.target.tagName !== "BUTTON")
                            setSelectedAdmission(req);
                        }}
                      >
                        <td className="p-4">
                          {req.photo_url ? (
                            <img
                              src={req.photo_url}
                              alt="s"
                              className="w-10 h-10 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-200 rounded-full" />
                          )}
                        </td>
                        <td className="p-4 font-semibold text-slate-700">
                          <button
                            className="text-left hover:text-indigo-600 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAdmission(req);
                            }}
                          >
                            {req.student_name}
                          </button>
                        </td>
                        <td className="p-4">{req.class}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">
                            {req.board}
                          </span>
                        </td>
                        <td className="p-4 flex items-center gap-3">
                          {req.status === "enrolled" ? (
                            <span className="text-green-600 font-mono text-sm bg-green-50 px-2 py-1 rounded">
                              {req.login_username}
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveAndEnroll(req);
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 shadow-sm transition"
                            >
                              Enroll
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAdmission(req.id);
                            }}
                            aria-label={`Delete admission for ${req.student_name}`}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition"
                          >
                            <RiDeleteBinLine size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          // EDIT ADMISSION FORM
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <RiEditLine /> Edit Admission Details
              </h2>
              <button
                aria-label="Close admission editor"
                onClick={() => setSelectedAdmission(null)}
                className="text-gray-500 hover:text-gray-800"
              >
                <RiCloseLine size={24} />
              </button>
            </div>
            <form
              onSubmit={handleUpdateAdmission}
              className="grid md:grid-cols-2 gap-6"
            >
              <div>
                <label
                  htmlFor="admission-field-1"
                  className="block text-xs font-bold text-gray-500 uppercase mb-1"
                >
                  Student Name
                </label>
                <input
                  id="admission-field-1"
                  className="w-full border p-2 rounded"
                  value={selectedAdmission.student_name}
                  onChange={(e) =>
                    setSelectedAdmission({
                      ...selectedAdmission,
                      student_name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="admission-field-2"
                  className="block text-xs font-bold text-gray-500 uppercase mb-1"
                >
                  Class
                </label>
                <input
                  id="admission-field-2"
                  className="w-full border p-2 rounded"
                  value={selectedAdmission.class}
                  onChange={(e) =>
                    setSelectedAdmission({
                      ...selectedAdmission,
                      class: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="admission-field-3"
                  className="block text-xs font-bold text-gray-500 uppercase mb-1"
                >
                  Board
                </label>
                <select
                  id="admission-field-3"
                  className="w-full border p-2 rounded bg-white"
                  value={selectedAdmission.board || "CBSE"}
                  onChange={(e) =>
                    setSelectedAdmission({
                      ...selectedAdmission,
                      board: e.target.value,
                    })
                  }
                >
                  <option>CBSE</option>
                  <option>ICSE</option>
                  <option>State Board</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="admission-field-4"
                  className="block text-xs font-bold text-gray-500 uppercase mb-1"
                >
                  Contact
                </label>
                <input
                  id="admission-field-4"
                  className="w-full border p-2 rounded"
                  value={selectedAdmission.contact_number}
                  onChange={(e) =>
                    setSelectedAdmission({
                      ...selectedAdmission,
                      contact_number: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="admission-field-5"
                  className="block text-xs font-bold text-gray-500 uppercase mb-1"
                >
                  Father's Name
                </label>
                <input
                  id="admission-field-5"
                  className="w-full border p-2 rounded"
                  value={selectedAdmission.father_name}
                  onChange={(e) =>
                    setSelectedAdmission({
                      ...selectedAdmission,
                      father_name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="admission-field-6"
                  className="block text-xs font-bold text-gray-500 uppercase mb-1"
                >
                  Parent Phone
                </label>
                <input
                  id="admission-field-6"
                  className="w-full border p-2 rounded"
                  value={selectedAdmission.parent_contact_number}
                  onChange={(e) =>
                    setSelectedAdmission({
                      ...selectedAdmission,
                      parent_contact_number: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="admission-field-7"
                  className="block text-xs font-bold text-gray-500 uppercase mb-1"
                >
                  Date of Birth
                </label>
                <input
                  id="admission-field-7"
                  type="date"
                  className="w-full border p-2 rounded"
                  value={selectedAdmission.dob}
                  onChange={(e) =>
                    setSelectedAdmission({
                      ...selectedAdmission,
                      dob: e.target.value,
                    })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="admission-field-8"
                  className="block text-xs font-bold text-gray-500 uppercase mb-1"
                >
                  Address
                </label>
                <textarea
                  id="admission-field-8"
                  className="w-full border p-2 rounded"
                  rows="2"
                  value={selectedAdmission.address}
                  onChange={(e) =>
                    setSelectedAdmission({
                      ...selectedAdmission,
                      address: e.target.value,
                    })
                  }
                />
              </div>

              <div className="md:col-span-2 flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAdmission(null)}
                  className="w-1/3 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
