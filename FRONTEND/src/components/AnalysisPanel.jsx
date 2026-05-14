function AnalysisPanel({ analysis }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">ATS score</p>
        <div className="mt-5 flex h-44 items-center justify-center rounded-lg bg-zinc-950 text-white">
          <span className="text-6xl font-black">{analysis?.atsScore ?? '--'}</span>
          <span className="mt-8 text-xl font-semibold text-zinc-300">/100</span>
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          {analysis?.roleFocus ? `Focused on ${analysis.roleFocus}` : 'Run an analysis to calculate the score.'}
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Improvement suggestions</h2>
        <div className="mt-4 space-y-3">
          {analysis?.suggestions?.length ? (
            analysis.suggestions.map((suggestion, index) => (
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4" key={`${suggestion}-${index}`}>
                <p className="text-sm text-zinc-800">{suggestion}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500">Suggestions will appear here after analysis.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalysisPanel
