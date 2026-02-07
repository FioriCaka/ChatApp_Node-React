function Sidebar({
  user,
  avatar,
  onCloseSidebar,
  onOpenProfile,
  onLogout,
  search,
  onSearchChange,
  tab,
  onTabChange,
  filteredChats,
  filteredContacts,
  activeContactId,
  contactInitials,
  selectContact,
  onlineIds,
}) {
  return (
    <aside className="sidebar">
      <div className="user-card">
        <div className="avatar">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.fullName} />
          ) : (
            avatar
          )}
        </div>
        <div className="user-meta">
          <p className="user-name">{user.fullName}</p>
          <p className="muted">{user.email}</p>
        </div>
        <div className="user-actions">
          <button
            className="ghost sidebar-toggle"
            type="button"
            onClick={onCloseSidebar}
          >
            Close
          </button>
          <button className="ghost" onClick={onOpenProfile}>
            Edit
          </button>
          <button className="ghost" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="search">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search people or chats"
        />
      </div>

      <div className="tabs">
        <button
          type="button"
          className={tab === "chats" ? "active" : ""}
          onClick={() => onTabChange("chats")}
        >
          Chats
        </button>
        <button
          type="button"
          className={tab === "contacts" ? "active" : ""}
          onClick={() => onTabChange("contacts")}
        >
          Contacts
        </button>
      </div>

      {tab === "chats" && (
        <div className="list">
          {filteredChats.length === 0 && (
            <p className="muted">No chats yet. Start a conversation.</p>
          )}
          {filteredChats.map((chat) => (
            <button
              key={chat.user?._id}
              type="button"
              className={`list-item ${
                activeContactId === chat.user?._id ? "active" : ""
              }`}
              onClick={() => selectContact(chat.user)}
            >
              <div className="list-item-avatar">
                {chat.user?.profilePicture ? (
                  <img
                    src={chat.user.profilePicture}
                    alt={chat.user.fullName}
                  />
                ) : (
                  contactInitials(chat.user)
                )}
              </div>
              <div className="list-item-title">
                {chat.user?.fullName}
                {chat.user?.online && <span className="online-dot" />}
              </div>
              <div className="muted small">
                {chat.lastMessage?.text ||
                  chat.lastMessage?.fileName ||
                  chat.lastMessage?.stickerName ||
                  (chat.lastMessage ? "Attachment" : "No messages yet")}
              </div>
              {chat.unreadCount > 0 && (
                <span className="badge">{chat.unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {tab === "contacts" && (
        <div className="list">
          {filteredContacts.length === 0 && (
            <p className="muted">No contacts yet. Create another user.</p>
          )}
          {filteredContacts.map((contact) => (
            <button
              key={contact._id}
              type="button"
              className={`list-item ${
                activeContactId === contact._id ? "active" : ""
              }`}
              onClick={() => selectContact(contact)}
            >
              <div className="list-item-avatar">
                {contact.profilePicture ? (
                  <img src={contact.profilePicture} alt={contact.fullName} />
                ) : (
                  contactInitials(contact)
                )}
              </div>
              <div className="list-item-title">
                {contact.fullName}
                {onlineIds.includes(String(contact._id)) && (
                  <span className="online-dot" />
                )}
              </div>
              <div className="muted small">{contact.email}</div>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
