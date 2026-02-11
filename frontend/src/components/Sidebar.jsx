function Sidebar({
  user,
  avatar,
  sidebarOpen,
  onCloseSidebar,
  onOpenServer,
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
    <aside
      className={`bg-slate-900 text-slate-200 p-6 flex flex-col gap-6 shadow-[12px_0_40px_rgba(15,23,42,0.2)] lg:static lg:translate-x-0 lg:w-auto fixed inset-y-0 left-0 w-[min(320px,85vw)] z-30 transition-transform overflow-auto ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-slate-900/90 p-4 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.1)]">
        <div className="w-11 h-11 rounded-[14px] bg-sky-400 text-slate-900 font-bold grid place-items-center overflow-hidden">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            avatar
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{user.fullName}</p>
          <p className="text-slate-400 text-sm">{user.email}</p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            className="rounded-xl border border-slate-800 px-3 py-2 text-sm"
            onClick={onOpenServer}
          >
            Server
          </button>
          <button
            className="rounded-xl border border-slate-800 px-3 py-2 text-sm"
            onClick={onOpenProfile}
          >
            Edit
          </button>
          <button
            className="rounded-xl border border-slate-800 px-3 py-2 text-sm"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search people or chats"
          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-slate-200"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className={`flex-1 rounded-xl border border-slate-800 px-3 py-2 text-sm ${
            tab === "chats"
              ? "bg-sky-400 text-slate-900 border-transparent"
              : ""
          }`}
          onClick={() => onTabChange("chats")}
        >
          Chats
        </button>
        <button
          type="button"
          className={`flex-1 rounded-xl border border-slate-800 px-3 py-2 text-sm ${
            tab === "contacts"
              ? "bg-sky-400 text-slate-900 border-transparent"
              : ""
          }`}
          onClick={() => onTabChange("contacts")}
        >
          Contacts
        </button>
      </div>

      {tab === "chats" && (
        <div className="flex flex-col gap-2">
          {filteredChats.length === 0 && (
            <p className="text-slate-400 text-sm">
              No chats yet. Start a conversation.
            </p>
          )}
          {filteredChats.map((chat) => (
            <button
              key={chat.user?._id}
              type="button"
              className={`relative text-left rounded-xl px-4 py-3 grid grid-cols-[40px_1fr] grid-rows-[auto_auto] gap-x-3 gap-y-0.5 transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(15,23,42,0.3)] ${
                activeContactId === chat.user?._id
                  ? "text-sky-400 border-transparent"
                  : "bg-slate-800 text-slate-200"
              }`}
              style={
                activeContactId === chat.user?._id
                  ? {
                      backgroundImage:
                        "linear-gradient(to bottom left, rgb(5, 154, 247), transparent)",
                      backgroundBlendMode: "screen",
                    }
                  : undefined
              }
              onClick={() => selectContact(chat.user)}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-500/30 grid place-items-center font-semibold overflow-hidden row-span-2">
                {chat.user?.profilePicture ? (
                  <img
                    src={chat.user.profilePicture}
                    alt={chat.user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  contactInitials(chat.user)
                )}
              </div>
              <div className="font-semibold flex items-center gap-1.5 col-start-2">
                {chat.user?.fullName}
                {chat.user?.online && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                )}
              </div>
              <div className="text-slate-300 text-xs col-start-2">
                {chat.lastMessage?.text ||
                  chat.lastMessage?.fileName ||
                  chat.lastMessage?.stickerName ||
                  (chat.lastMessage ? "Attachment" : "No messages yet")}
              </div>
              {chat.unreadCount > 0 && (
                <span className="absolute top-2 right-2 rounded-full bg-sky-400 text-slate-900 px-2 py-0.5 text-xs font-semibold border-transparent">
                  {chat.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {tab === "contacts" && (
        <div className="flex flex-col gap-2">
          {filteredContacts.length === 0 && (
            <p className="text-slate-400 text-sm">
              No contacts yet. Create another user.
            </p>
          )}
          {filteredContacts.map((contact) => (
            <button
              key={contact._id}
              type="button"
              className={`relative text-left rounded-xl px-4 py-3 bg-slate-800 text-slate-200 grid grid-cols-[40px_1fr] grid-rows-[auto_auto] gap-x-3 gap-y-0.5 transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(15,23,42,0.3)] ${
                activeContactId === contact._id
                  ? "bg-sky-400 text-slate-900 border-transparent"
                  : ""
              }`}
              onClick={() => selectContact(contact)}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-500/30 grid place-items-center font-semibold overflow-hidden row-span-2">
                {contact.profilePicture ? (
                  <img
                    src={contact.profilePicture}
                    alt={contact.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  contactInitials(contact)
                )}
              </div>
              <div className="font-semibold flex items-center gap-1.5 col-start-2">
                {contact.fullName}
                {onlineIds.includes(String(contact._id)) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                )}
              </div>
              <div className="text-slate-300 text-xs col-start-2">
                {contact.email}
              </div>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
