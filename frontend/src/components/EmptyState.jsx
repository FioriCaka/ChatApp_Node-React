function EmptyState({ userFirstName, onOpenSidebar }) {
  return (
    <div className="empty-state">
      <div className="empty-header">
        <button
          className="ghost sidebar-toggle"
          type="button"
          onClick={onOpenSidebar}
        >
          Menu
        </button>
      </div>
      <h2>Welcome back, {userFirstName}</h2>
      <p className="muted">Pick a contact or chat to start messaging.</p>
    </div>
  );
}

export default EmptyState;
