function ProfileModal({
  profileOpen,
  profileForm,
  onChange,
  onSubmit,
  onClose,
}) {
  if (!profileOpen) return null;

  return (
    <div className="modal">
      <div className="modal-card">
        <h2>Edit profile</h2>
        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Full name
            <input
              value={profileForm.fullName}
              onChange={(event) => onChange("fullName", event.target.value)}
            />
          </label>
          <label>
            Avatar URL
            <input
              value={profileForm.profilePicture}
              onChange={(event) =>
                onChange("profilePicture", event.target.value)
              }
            />
          </label>
          <div className="modal-actions">
            <button type="submit">Save</button>
            <button type="button" className="ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;
