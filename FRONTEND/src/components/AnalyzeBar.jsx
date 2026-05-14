function AnalyzeBar({
  jobRole,
  loading,
  onAnalyze,
  onJobRoleChange,
  selectedResume,
  selectedResumeId,
  token,
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <label className="flex-1 text-sm font-medium">
          Target job role
          <input
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-teal-700"
            onChange={(event) => onJobRoleChange(event.target.value)}
            placeholder="Frontend Developer, Data Analyst, Product Manager..."
            type="text"
            value={jobRole}
          />
        </label>

        <button
          className="rounded-md bg-zinc-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-60"
          disabled={!token || !selectedResumeId || loading === 'analysis'}
          onClick={onAnalyze}
          type="button"
        >
          {loading === 'analysis' ? 'Analyzing...' : 'Analyze resume'}
        </button>
      </div>

      {selectedResume && (
        <p className="mt-3 text-sm text-zinc-500">
          Selected: <span className="font-semibold text-zinc-800">{selectedResume.fileName}</span>
        </p>
      )}
    </div>
  )
}

export default AnalyzeBar
