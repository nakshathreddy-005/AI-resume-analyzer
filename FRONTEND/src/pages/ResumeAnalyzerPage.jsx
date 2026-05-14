import AlertBanner from '../components/AlertBanner'
import AnalyzeBar from '../components/AnalyzeBar'
import ResumeLibrary from '../components/ResumeLibrary'
import UploadForm from '../components/UploadForm'

function ResumeAnalyzerPage({
  error,
  hasAnalysis,
  jobRole,
  loading,
  notice,
  onAnalyze,
  onFileChange,
  onJobRoleChange,
  onResumeChange,
  onShowResults,
  onUpload,
  resumes,
  selectedResume,
  selectedResumeId,
  token,
}) {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[380px_1fr] lg:px-8">
      <aside className="space-y-6">
        <UploadForm loading={loading} onFileChange={onFileChange} onUpload={onUpload} />

        <ResumeLibrary
          onResumeChange={onResumeChange}
          resumes={resumes}
          selectedResumeId={selectedResumeId}
        />
      </aside>

      <section className="space-y-6">
        <AlertBanner error={error} notice={notice} />

        <AnalyzeBar
          jobRole={jobRole}
          loading={loading}
          onAnalyze={onAnalyze}
          onJobRoleChange={onJobRoleChange}
          selectedResume={selectedResume}
          selectedResumeId={selectedResumeId}
          token={token}
        />

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Next step</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Upload or select a resume, enter a target role, then analyze it to see suggestions and job matches.
          </p>

          <button
            className="mt-4 rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-bold text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
            disabled={!hasAnalysis}
            onClick={onShowResults}
            type="button"
          >
            View latest results
          </button>
        </div>
      </section>
    </div>
  )
}

export default ResumeAnalyzerPage
