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
    <div className="auth-container">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">LC</div>
          <div>
            <h1>Local Chat</h1>
            <p className="muted">Sign in to start chatting locally.</p>
          </div>
        </div>
        <form className="auth-form" onSubmit={onSubmit}>
          {authMode === "signup" && (
            <label>
              Full name
              <input
                value={authForm.fullName}
                onChange={(event) =>
                  setAuthForm({ ...authForm, fullName: event.target.value })
                }
                placeholder="Jane Doe"
                required
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              value={authForm.email}
              onChange={(event) =>
                setAuthForm({ ...authForm, email: event.target.value })
              }
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={authForm.password}
              onChange={(event) =>
                setAuthForm({ ...authForm, password: event.target.value })
              }
              placeholder="••••••••"
              required
            />
          </label>
          {authError && <div className="error">{authError}</div>}
          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : authMode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>
        <button type="button" className="ghost" onClick={onToggleMode}>
          {authMode === "login"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

export default AuthView;
