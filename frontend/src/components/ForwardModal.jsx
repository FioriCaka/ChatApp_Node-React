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
    <div className="modal">
      <div className="modal-card">
        <h2>Forward message</h2>
        <div className="list">
          {contacts.map((contact) => (
            <button
              key={contact._id}
              type="button"
              className={`list-item ${
                selectedForwardContact?._id === contact._id ? "active" : ""
              }`}
              onClick={() => onSelectContact(contact)}
            >
              <div className="list-item-avatar">
                {contact.profilePicture ? (
                  <img src={contact.profilePicture} alt={contact.fullName} />
                ) : (
                  contactInitials(contact)
                )}
              </div>
              <div className="list-item-title">{contact.fullName}</div>
              <div className="muted small">{contact.email}</div>
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onSend}>
            Send
          </button>
          <button type="button" className="ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForwardModal;
