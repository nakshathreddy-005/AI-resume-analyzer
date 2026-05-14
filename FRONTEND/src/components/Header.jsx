function Header({ user, onLogout }) {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">AI Resume Analyzer</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Resume scoring dashboard</h1>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold">{user.username}</p>
              <p className="text-xs text-zinc-500">{user.email}</p>
            </div>
            <button
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
              onClick={onLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default Header
