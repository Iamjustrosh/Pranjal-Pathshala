import {
  RiBookOpenLine,
  RiDownloadLine,
  RiExternalLinkLine,
} from 'react-icons/ri';

export default function StudyPage({
  student,
  materials,
  loading,
  materialSubject,
  setMaterialSubject,
}) {
  const subjects = [
    ...new Set(
      materials
        .map((material) => material.subject)
        .filter(Boolean)
    ),
  ];

  const filteredMaterials =
    materialSubject === 'All'
      ? materials
      : materials.filter(
          (material) =>
            material.subject === materialSubject
        );

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <RiBookOpenLine
            size={21}
            className="text-indigo-600"
          />

          <h2 className="text-xl font-bold text-slate-900">
            Study
          </h2>
        </div>

        <p className="mt-1 text-sm text-slate-400">
          Notes, resources and NCERT books.
        </p>
      </div>

      {/* NCERT */}
      <section
        className="
          relative overflow-hidden
          rounded-3xl
          bg-gradient-to-br
          from-indigo-600 to-violet-600
          p-5 text-white
          shadow-lg shadow-indigo-100
        "
      >
        <div className="relative z-10">
          <div
            className="
              mb-4 flex h-11 w-11
              items-center justify-center
              rounded-2xl bg-white/15
            "
          >
            <RiBookOpenLine size={22} />
          </div>

          <h3 className="text-xl font-bold">
            NCERT Corner
          </h3>

          <p className="mt-1 text-sm leading-6 text-indigo-100">
            Official textbooks and learning resources
            for Class {student.class}.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <a
              href="https://ncert.nic.in/textbook.php"
              target="_blank"
              rel="noreferrer"
              className="
                flex items-center justify-center gap-2
                rounded-xl bg-white
                px-3 py-3
                text-xs font-bold text-indigo-700
              "
            >
              <RiDownloadLine size={16} />
              Books
            </a>

            <a
              href="https://www.learncbse.in/ncert-solutions-2/"
              target="_blank"
              rel="noreferrer"
              className="
                flex items-center justify-center gap-2
                rounded-xl bg-white/15
                px-3 py-3
                text-xs font-bold text-white
              "
            >
              <RiExternalLinkLine size={16} />
              Solutions
            </a>
          </div>
        </div>

        <div
          className="
            absolute -right-14 -top-14
            h-44 w-44 rounded-full
            bg-white/10 blur-2xl
          "
        />
      </section>

      {/* MATERIALS */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">
            Study Materials
          </h3>

          <select
            value={materialSubject}
            onChange={(event) =>
              setMaterialSubject(event.target.value)
            }
            className="
              max-w-[150px] rounded-xl
              border border-slate-200
              bg-white px-3 py-2
              text-xs text-slate-600
              outline-none
            "
          >
            <option value="All">
              All Subjects
            </option>

            {subjects.map((subject) => (
              <option
                key={subject}
                value={subject}
              >
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Loading materials...
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div
              className="
                rounded-3xl border border-dashed
                border-slate-200 bg-white
                px-4 py-12 text-center
                text-sm text-slate-400
              "
            >
              No study materials available.
            </div>
          ) : (
            filteredMaterials.map((material) => (
              <a
                key={material.id}
                href={material.url}
                target="_blank"
                rel="noreferrer"
                className="
                  flex items-center justify-between
                  rounded-2xl border border-slate-100
                  bg-white p-4 shadow-sm
                  transition active:scale-[0.98]
                "
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800">
                    {material.title}
                  </p>

                  <div className="mt-1 flex gap-2">
                    <span
                      className="
                        rounded-lg bg-indigo-50
                        px-2 py-1 text-[10px]
                        font-semibold text-indigo-600
                      "
                    >
                      {material.subject}
                    </span>

                    {material.material_type &&
                      material.material_type !==
                        'other' && (
                        <span
                          className="
                            rounded-lg bg-slate-100
                            px-2 py-1 text-[10px]
                            text-slate-500
                          "
                        >
                          {material.material_type}
                        </span>
                      )}
                  </div>
                </div>

                <div
                  className="
                    ml-3 flex h-10 w-10
                    shrink-0 items-center justify-center
                    rounded-xl bg-slate-50
                    text-indigo-600
                  "
                >
                  <RiExternalLinkLine />
                </div>
              </a>
            ))
          )}
        </div>
      </section>
    </div>
  );
}