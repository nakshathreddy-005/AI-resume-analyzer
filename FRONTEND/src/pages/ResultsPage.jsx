import AlertBanner from '../components/AlertBanner'
import AnalysisPanel from '../components/AnalysisPanel'
import JobRecommendations from '../components/JobRecommendations'
import ModifiedResume from '../components/ModifiedResume'

function ResultsPage({
  analysis,
  error,
  jobs,
  loading,
  modifiedResume,
  notice,
  onBack,
  onDownload,
  onRewrite,
  selectedResume,
  selectedResumeId,
  token,
}) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Results</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            {selectedResume ? selectedResume.fileName : 'Resume analysis'}
          </h2>
        </div>

        <button
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
          onClick={onBack}
          type="button"
        >
          Back to upload
        </button>
      </div>

      <AlertBanner error={error} notice={notice} />

      <AnalysisPanel analysis={analysis} />

      <JobRecommendations jobs={jobs} />

      <ModifiedResume
        loading={loading}
        modifiedResume={modifiedResume}
        onDownload={onDownload}
        onRewrite={onRewrite}
        selectedResumeId={selectedResumeId}
        token={token}
      />
    </div>
  )
}

export default ResultsPage
