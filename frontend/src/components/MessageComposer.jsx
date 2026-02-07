function MessageComposer({
  messageText,
  onMessageChange,
  onSendMessage,
  onAttachment,
  onToggleEmotes,
  onToggleStickers,
  showEmotes,
  showStickers,
  emotes,
  stickers,
  onInsertEmote,
  onSelectSticker,
  sendDisabled,
}) {
  return (
    <>
      <form className="composer" onSubmit={onSendMessage}>
        <div className="composer-actions">
          <label className="attach">
            <input
              type="file"
              accept="*/*"
              onChange={(event) => onAttachment(event.target.files[0])}
            />
            📎
          </label>
          <button type="button" className="ghost" onClick={onToggleEmotes}>
            🙂
          </button>
          <button type="button" className="ghost" onClick={onToggleStickers}>
            🧩
          </button>
        </div>
        <input
          value={messageText}
          onChange={(event) => onMessageChange(event.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" disabled={sendDisabled}>
          Send
        </button>
      </form>
      {showEmotes && (
        <div className="picker">
          {emotes.map((emote) => (
            <button
              key={emote}
              type="button"
              onClick={() => onInsertEmote(emote)}
            >
              {emote}
            </button>
          ))}
        </div>
      )}
      {showStickers && (
        <div className="picker picker-grid">
          {stickers.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => onSelectSticker(item)}
            >
              <img src={item.url} alt={item.name} />
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default MessageComposer;
