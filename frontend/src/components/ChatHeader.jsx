function ChatHeader({
  activeContact,
  contactInitials,
  typingUsers,
  onlineIds,
  onOpenSidebar,
  onCloseChat,
}) {
  const activeContactId = activeContact?._id;
  return (
    <header>
      <div>
        <div className="chat-header">
          <div className="avatar small">
            {activeContact.profilePicture ? (
              <img
                src={activeContact.profilePicture}
                alt={activeContact.fullName}
              />
            ) : (
              contactInitials(activeContact)
            )}
          </div>
          <div>
            <h2>{activeContact.fullName}</h2>
            <p className="muted">
              {activeContact.email} ·{" "}
              {typingUsers[activeContactId]
                ? "Typing..."
                : onlineIds.includes(String(activeContactId))
                  ? "Online"
                  : "Offline"}
            </p>
          </div>
        </div>
      </div>
      <div className="header-actions">
        <button
          className="ghost sidebar-toggle"
          type="button"
          onClick={onOpenSidebar}
        >
          Menu
        </button>
        <button className="ghost" type="button" onClick={onCloseChat}>
          Close
        </button>
      </div>
    </header>
  );
}

export default ChatHeader;
