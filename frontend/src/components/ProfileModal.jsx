function ProfileModal({
  profileOpen,
  profileForm,
  profilePreview,
  onChange,
  onFileChange,
  onSubmit,
  onClose,
}) {
  if (!profileOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 grid place-items-center z-30">
      <div className="w-[min(420px,90%)] bg-white p-6 rounded-2xl">
        <h2>Edit profile</h2>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm">
            Full name
            <input
              value={profileForm.fullName}
              onChange={(event) => onChange("fullName", event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Profile picture
            <input
              type="file"
              accept="image/*"
              onChange={(event) => onFileChange(event.target.files?.[0])}
              className="rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          {profilePreview && (
            <div className="flex items-center gap-3">
              <img
                src={profilePreview}
                alt="Profile preview"
                className="w-16 h-16 rounded-2xl object-cover"
              />
              <span className="text-xs text-slate-500">Preview</span>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-white"
            >
              Save
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;
