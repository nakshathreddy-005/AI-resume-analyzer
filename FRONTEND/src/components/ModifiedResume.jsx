function ModifiedResume({
  loading,
  modifiedResume,
  onDownload,
  onRewrite,
  selectedResumeId,
  token,
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-bold">Modified resume</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Generate an improved ATS-friendly resume from the current analysis.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60"
            disabled={!token || !selectedResumeId || loading === 'rewrite'}
            onClick={onRewrite}
            type="button"
          >
            {loading === 'rewrite' ? 'Generating...' : 'Generate modified resume'}
          </button>

          <button
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-bold text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
            disabled={!modifiedResume}
            onClick={onDownload}
            type="button"
          >
            Download PDF
          </button>
        </div>
      </div>

      {modifiedResume ? (
        <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800">
          {modifiedResume}
        </pre>
      ) : (
        <p className="mt-4 rounded-md bg-zinc-50 p-4 text-sm text-zinc-500">
          Your generated resume preview will appear here after you run analysis and generate the modified resume.
        </p>
      )}
    </div>
  )
}

export default ModifiedResume
