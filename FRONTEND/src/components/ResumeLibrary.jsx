function ResumeLibrary({ resumes, selectedResumeId, onResumeChange }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">Resume library</h2>
      <div className="mt-4 space-y-2">
        {resumes.length === 0 && <p className="text-sm text-zinc-500">No resumes uploaded yet.</p>}

        {resumes.map((resume) => (
          <button
            className={`w-full rounded-md border p-3 text-left text-sm ${
              selectedResumeId === resume._id
                ? 'border-teal-700 bg-teal-50'
                : 'border-zinc-200 hover:bg-zinc-50'
            }`}
            key={resume._id}
            onClick={() => onResumeChange(resume._id)}
            type="button"
          >
            <span className="block font-semibold">{resume.fileName}</span>
            <span className="text-xs text-zinc-500">
              {new Date(resume.createdAt).toLocaleString()}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ResumeLibrary
