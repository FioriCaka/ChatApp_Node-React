import { formatDay, formatTime } from "../lib/chatConstants";

function MessageList({
  messages,
  userId,
  editingMessageId,
  editingText,
  onEditTextChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onReply,
  onForward,
  onReact,
  onDelete,
  messagesEndRef,
}) {
  return (
    <div className="messages">
      {messages.length === 0 && (
        <p className="muted">No messages yet. Say hello 👋</p>
      )}
      {messages.map((msg, index) => {
        const showDay =
          index === 0 ||
          formatDay(messages[index - 1].createdAt) !== formatDay(msg.createdAt);
        const isOwn = msg.senderId === userId;
        const reactions = msg.reactions || [];
        const reactionCounts = reactions.reduce((acc, reaction) => {
          acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
          return acc;
        }, {});
        const reply = msg.replyPreview;
        const forwarded = msg.forwardedFrom;
        const statusLabel = isOwn
          ? msg.readAt
            ? "Read"
            : msg.deliveredAt
              ? "Delivered"
              : "Sent"
          : "";
        return (
          <div key={msg._id}>
            {showDay && (
              <div className="day-separator">{formatDay(msg.createdAt)}</div>
            )}
            <div className={`message ${isOwn ? "outgoing" : "incoming"}`}>
              {forwarded && (
                <div className="forwarded">
                  Forwarded
                  <span>
                    {forwarded.text ||
                      forwarded.fileName ||
                      forwarded.stickerName ||
                      "Attachment"}
                  </span>
                </div>
              )}
              {reply && (
                <div className="reply-preview">
                  <span>Replying to</span>
                  <strong>
                    {reply.text ||
                      reply.fileName ||
                      reply.stickerName ||
                      "Attachment"}
                  </strong>
                </div>
              )}
              {msg.stickerUrl && (
                <img
                  src={msg.stickerUrl}
                  alt={msg.stickerName || "sticker"}
                  className="sticker-image"
                />
              )}
              {msg.image && (
                <img
                  src={msg.image || msg.fileUrl}
                  alt={msg.fileName || "attachment"}
                  className="message-image"
                />
              )}
              {msg.fileName && !msg.image && (
                <div className="file-pill">
                  {msg.fileUrl ? (
                    <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                      {msg.fileName}
                    </a>
                  ) : (
                    <span>{msg.fileName}</span>
                  )}
                </div>
              )}
              {editingMessageId === msg._id ? (
                <div className="edit-row">
                  <input
                    value={editingText}
                    onChange={(event) => onEditTextChange(event.target.value)}
                  />
                  <button type="button" onClick={() => onSaveEdit(msg._id)}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={onCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                msg.text && <p>{msg.text}</p>
              )}
              <div className="message-meta">
                <span className="timestamp">{formatTime(msg.createdAt)}</span>
                {msg.editedAt && <span className="edited">Edited</span>}
                {isOwn && <span className="read">{statusLabel}</span>}
              </div>
              {Object.keys(reactionCounts).length > 0 && (
                <div className="reactions">
                  {Object.entries(reactionCounts).map(([emoji, count]) => (
                    <span key={emoji} className="reaction-pill">
                      {emoji} {count}
                    </span>
                  ))}
                </div>
              )}
              {editingMessageId !== msg._id && (
                <div className="message-actions">
                  {isOwn && (
                    <button type="button" onClick={() => onStartEdit(msg)}>
                      Edit
                    </button>
                  )}
                  <button type="button" onClick={() => onReply(msg)}>
                    Reply
                  </button>
                  <button type="button" onClick={() => onForward(msg)}>
                    Forward
                  </button>
                  <button type="button" onClick={() => onReact(msg._id, "👍")}>
                    👍
                  </button>
                  <button type="button" onClick={() => onReact(msg._id, "❤️")}>
                    ❤️
                  </button>
                  {isOwn && (
                    <button
                      type="button"
                      onClick={() => onDelete(msg._id, "me")}
                    >
                      Delete for me
                    </button>
                  )}
                  {isOwn && (
                    <button
                      type="button"
                      onClick={() => onDelete(msg._id, "all")}
                    >
                      Delete for all
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
