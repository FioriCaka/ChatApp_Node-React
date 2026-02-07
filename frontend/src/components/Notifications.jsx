function Notifications({ notifications, onDismiss }) {
  if (notifications.length === 0) return null;

  return (
    <div className="notifications">
      {notifications.map((note) => (
        <div key={note.id} className="notification">
          <strong>{note.title}</strong>
          <p>{note.text}</p>
          <button
            type="button"
            className="ghost"
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
