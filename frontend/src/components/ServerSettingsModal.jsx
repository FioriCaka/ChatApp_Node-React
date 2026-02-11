function ServerSettingsModal({ open, serverUrl, onChange, onSave, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 grid place-items-center z-30">
      <div className="w-[min(420px,90%)] bg-white p-6 rounded-2xl">
        <h2>Server settings</h2>
        <p className="text-slate-500 text-sm mt-2">
          Update the backend URL when your network changes.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm">
            API URL
            <input
              value={serverUrl}
              onChange={(event) => onChange(event.target.value)}
              placeholder="http://192.168.0.10:3000"
              className="rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-4 py-2 text-white"
              onClick={onSave}
            >
              Save & reload
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServerSettingsModal;
