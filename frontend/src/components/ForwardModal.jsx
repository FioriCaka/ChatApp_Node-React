function ForwardModal({
  forwardOpen,
  contacts,
  selectedForwardContact,
  onSelectContact,
  onSend,
  onCancel,
  contactInitials,
}) {
  if (!forwardOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 grid place-items-center z-30 ui-fade-in">
      <div className="w-[min(420px,90%)] liquid-card liquid-sheen p-6 rounded-2xl theme-header-grad ui-pop-in">
        <h2>Forward message</h2>
        <div className="mt-4 flex flex-col gap-2">
          {contacts.map((contact) => (
            <button
              key={contact._id}
              type="button"
              className={`relative text-left rounded-xl px-4 py-3 bg-slate-100 text-slate-900 grid grid-cols-[40px_1fr] grid-rows-[auto_auto] gap-x-3 gap-y-0.5 ui-ease ui-press ui-hover ui-focus ${
                selectedForwardContact?._id === contact._id
                  ? "theme-accent-bg"
                  : ""
              }`}
              onClick={() => onSelectContact(contact)}
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
              <div className="font-semibold col-start-2">
                {contact.fullName}
              </div>
              <div className="text-slate-500 text-xs col-start-2">
                {contact.email}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onSend}
            className="rounded-xl theme-accent-bg px-4 py-2 ui-ease ui-press ui-hover ui-focus"
          >
            Send
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2 bg-white/60 backdrop-blur ui-ease ui-press ui-hover ui-focus"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForwardModal;
