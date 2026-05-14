function UploadForm({ loading, onFileChange, onUpload }) {
  return (
    <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" onSubmit={onUpload}>
      <h2 className="text-lg font-bold">Upload resume</h2>
      <p className="mt-1 text-sm text-zinc-500">Backend accepts PDF files using the field name resume.</p>

      <input
        accept="application/pdf,.pdf"
        className="mt-4 w-full rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-4 text-sm"
        onChange={(event) => onFileChange(event.target.files?.[0] || null)}
        required
        type="file"
      />

      <button
        className="mt-4 w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60"
        disabled={loading === 'upload'}
        type="submit"
      >
        {loading === 'upload' ? 'Uploading...' : 'Upload PDF'}
      </button>
    </form>
  )
}

export default UploadForm
