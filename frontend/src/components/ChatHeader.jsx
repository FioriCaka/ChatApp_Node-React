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
    <header className="sticky top-0 z-10 liquid-card border-b border-slate-200 px-8 py-6 pb-4 max-[768px]:px-4 max-[768px]:py-4 transition-opacity theme-header-grad liquid-sheen">
      <div className="flex items-center justify-between mt-4">
        <button
          className="rounded-xl px-3 py-2 text-sm lg:hidden"
          type="button"
          onClick={onOpenSidebar}
        >
          <img src="/menu-outline.svg" alt="Menu" className="h-6 w-6" />
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl theme-accent-bg font-bold grid place-items-center overflow-hidden">
              {activeContact.profilePicture ? (
                <img
                  src={activeContact.profilePicture}
                  alt={activeContact.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                contactInitials(activeContact)
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {activeContact.fullName}
              </h2>
              <p className="text-slate-500 text-sm">
                {typingUsers[activeContactId]
                  ? "Typing..."
                  : onlineIds.includes(String(activeContactId))
                    ? "Online"
                    : "Offline"}
              </p>
            </div>
          </div>
        </div>

        <button
          className="rounded-xl px-3 py-2 text-sm"
          type="button"
          onClick={onCloseChat}
        >
          <img
            src="/close-circle-outline.svg"
            alt="close"
            className="h-7 w-7"
          />
        </button>
      </div>
    </header>
  );
}

export default ChatHeader;
