function Notifications({ notifications, onDismiss }) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-20 max-[768px]:right-3 max-[768px]:bottom-3">
      {notifications.map((note) => (
        <div
          key={note.id}
          className="bg-slate-900 text-slate-200 p-4 rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.35)] flex flex-col gap-2 w-[min(320px,90vw)]"
        >
          <strong>{note.title}</strong>
          <p>{note.text}</p>
          <button
            type="button"
            className="rounded-xl border border-slate-800 px-3 py-2 text-sm"
            onClick={() => onDismiss(note.id)}
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}

export default Notifications;
