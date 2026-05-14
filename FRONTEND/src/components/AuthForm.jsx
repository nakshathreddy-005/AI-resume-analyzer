function AuthForm({ authForm, loading, mode, onAuth, onModeChange, onAuthFormChange }) {
  return (
    <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" onSubmit={onAuth}>
      <div className="mb-5 flex rounded-md bg-zinc-100 p-1">
        {['login', 'register'].map((item) => (
          <button
            className={`flex-1 rounded px-3 py-2 text-sm font-semibold capitalize ${
              mode === item ? 'bg-white shadow-sm' : 'text-zinc-500'
            }`}
            key={item}
            onClick={() => onModeChange(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      {mode === 'register' && (
        <label className="mb-4 block text-sm font-medium">
          Username
          <input
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-teal-700"
            minLength="4"
            onChange={(event) => onAuthFormChange({ ...authForm, username: event.target.value })}
            required
            type="text"
            value={authForm.username}
          />
        </label>
      )}

      <label className="mb-4 block text-sm font-medium">
        Email
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-teal-700"
          onChange={(event) => onAuthFormChange({ ...authForm, email: event.target.value })}
          required
          type="email"
          value={authForm.email}
        />
      </label>

      <label className="mb-5 block text-sm font-medium">
        Password
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-teal-700"
          onChange={(event) => onAuthFormChange({ ...authForm, password: event.target.value })}
          required
          type="password"
          value={authForm.password}
        />
      </label>

      <button
        className="w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60"
        disabled={loading === 'auth'}
        type="submit"
      >
        {loading === 'auth' ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
      </button>
    </form>
  )
}

export default AuthForm
