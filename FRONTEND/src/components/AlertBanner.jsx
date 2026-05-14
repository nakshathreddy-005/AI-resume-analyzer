function AlertBanner({ error, notice }) {
  if (!notice && !error) return null

  return (
    <div
      className={`rounded-md border px-4 py-3 text-sm ${
        error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}
    >
      {error || notice}
    </div>
  )
}

export default AlertBanner
