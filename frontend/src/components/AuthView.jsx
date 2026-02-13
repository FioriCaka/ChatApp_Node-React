function AuthView({
  authMode,
  authForm,
  setAuthForm,
  authError,
  loading,
  onSubmit,
  onToggleMode,
}) {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-900 text-slate-200 p-6">
      <div className="w-full max-w-105 bg-slate-900 p-8 rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl theme-accent-bg grid place-items-center font-bold">
            LC
          </div>
          <div>
            <h1>Local Chat</h1>
            <p className="text-slate-400">Sign in to start chatting locally.</p>
          </div>
        </div>
        <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
          {authMode === "signup" && (
            <label className="flex flex-col gap-2 text-sm">
              Full name
              <input
                value={authForm.fullName}
                onChange={(event) =>
                  setAuthForm({ ...authForm, fullName: event.target.value })
                }
                placeholder="Jane Doe"
                required
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-200"
              />
            </label>
          )}
          <label className="flex flex-col gap-2 text-sm">
            Email
            <input
              type="email"
              value={authForm.email}
              onChange={(event) =>
                setAuthForm({ ...authForm, email: event.target.value })
              }
              placeholder="you@example.com"
              required
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-200"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Password
            <input
              type="password"
              value={authForm.password}
              onChange={(event) =>
                setAuthForm({ ...authForm, password: event.target.value })
              }
              placeholder="••••••••"
              required
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-200"
            />
          </label>
          {authError && <div className="text-rose-400">{authError}</div>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl theme-accent-bg py-3 font-semibold disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : authMode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>
        <button
          type="button"
          className="mt-4 rounded-xl border border-slate-800 px-3 py-2 text-sm"
          onClick={onToggleMode}
        >
          {authMode === "login"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

export default AuthView;
