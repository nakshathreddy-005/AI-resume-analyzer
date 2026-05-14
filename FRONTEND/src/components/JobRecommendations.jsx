function JobRecommendations({ jobs }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">Recommended jobs</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {jobs.length ? (
          jobs.map((job, index) => (
            <article className="rounded-lg border border-zinc-200 p-4" key={job._id || `${job.role}-${index}`}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold">{job.role}</h3>
                <span className="rounded bg-teal-100 px-2 py-1 text-sm font-bold text-teal-800">
                  {job.matchScore}%
                </span>
              </div>
              <p className="mt-3 text-sm text-zinc-600">{job.reason}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(job.missingSkills || []).map((skill) => (
                  <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))
        ) : (
          <p className="text-sm text-zinc-500">Job recommendations will appear after analysis.</p>
        )}
      </div>
    </div>
  )
}

export default JobRecommendations
