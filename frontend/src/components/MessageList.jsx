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
  messagesContainerRef,
  messagesEndRef,
}) {
  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-3 max-[768px]:px-4 max-[520px]:px-3"
    >
      {messages.length === 0 && (
        <p className="text-slate-500">No messages yet. Say hello 👋</p>
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
              <div className="text-center text-xs text-slate-400 my-2">
                {formatDay(msg.createdAt)}
              </div>
            )}
            <div
              className={`max-w-[70%] rounded-2xl p-3 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.08)] ${
                isOwn
                  ? "bg-sky-400 text-slate-900 self-end"
                  : "bg-white border border-slate-200 self-start"
              } max-[768px]:max-w-[85%] max-[520px]:max-w-full`}
            >
              {forwarded && (
                <div className="bg-slate-900/10 rounded-xl px-3 py-1.5 text-xs flex flex-col gap-1 mb-2">
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
                <div className="bg-slate-900/10 rounded-xl px-3 py-1.5 text-xs flex flex-col gap-1 mb-2">
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
                  className="w-40 h-40 object-contain rounded-2xl mb-2 bg-slate-900/5 p-2 max-[520px]:w-28 max-[520px]:h-28"
                />
              )}
              {msg.image && (
                <img
                  src={msg.image || msg.fileUrl}
                  alt={msg.fileName || "attachment"}
                  className="w-full max-w-64 rounded-xl mb-2 block"
                />
              )}
              {msg.fileName && !msg.image && (
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/10 px-3 py-1 text-sm mb-2">
                  {msg.fileUrl ? (
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-inherit no-underline"
                    >
                      {msg.fileName}
                    </a>
                  ) : (
                    <span>{msg.fileName}</span>
                  )}
                </div>
              )}
              {editingMessageId === msg._id ? (
                <div className="flex items-center gap-2">
                  <input
                    value={editingText}
                    onChange={(event) => onEditTextChange(event.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => onSaveEdit(msg._id)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs"
                    onClick={onCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                msg.text && <p>{msg.text}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span>{formatTime(msg.createdAt)}</span>
                {msg.editedAt && <span className="opacity-70">Edited</span>}
                {isOwn && <span className="opacity-70">{statusLabel}</span>}
              </div>
              {Object.keys(reactionCounts).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {Object.entries(reactionCounts).map(([emoji, count]) => (
                    <span
                      key={emoji}
                      className="rounded-full bg-slate-900/10 px-2 py-0.5 text-xs"
                    >
                      {emoji} {count}
                    </span>
                  ))}
                </div>
              )}
              {editingMessageId !== msg._id && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {isOwn && (
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-2 py-1 text-xs"
                      onClick={() => onStartEdit(msg)}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-2 py-1 text-xs"
                    onClick={() => onReply(msg)}
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-2 py-1 text-xs"
                    onClick={() => onForward(msg)}
                  >
                    Forward
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-2 py-1 text-xs"
                    onClick={() => onReact(msg._id, "👍")}
                  >
                    👍
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-2 py-1 text-xs"
                    onClick={() => onReact(msg._id, "❤️")}
                  >
                    ❤️
                  </button>
                  {isOwn && (
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-2 py-1 text-xs"
                      onClick={() => onDelete(msg._id, "me")}
                    >
                      Delete for me
                    </button>
                  )}
                  {isOwn && (
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-2 py-1 text-xs"
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
