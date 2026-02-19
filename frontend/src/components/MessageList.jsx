import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import EmojiPicker from "emoji-picker-react";
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
  const MENU_WIDTH = 176;
  const MENU_HEIGHT = 240;
  const PICKER_WIDTH = 300;
  const PICKER_HEIGHT = 360;
  const VIEWPORT_PADDING = 8;
  const OFFSET = 8;
  const SWIPE_TRIGGER = 72;
  const SWIPE_MAX = 112;

  const [openMenuForId, setOpenMenuForId] = useState(null);
  const [openPickerForId, setOpenPickerForId] = useState(null);
  const [popupAnchor, setPopupAnchor] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [swipeState, setSwipeState] = useState({ id: null, offset: 0 });
  const swipeRef = useRef({ id: null, startX: 0, startY: 0, active: false });
  const swipeOffsetRef = useRef({ id: null, offset: 0 });

  const openMenuAtButton = (event, messageId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupAnchor({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
    });
    const nextOpen = openMenuForId === messageId ? null : messageId;
    setOpenMenuForId(nextOpen);
    if (nextOpen !== messageId) {
      setOpenPickerForId(null);
      setPopupAnchor(null);
      setPendingDelete(null);
    }
  };

  const getPopupStyle = (type) => {
    if (!popupAnchor) {
      return {};
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = type === "menu" ? MENU_WIDTH : PICKER_WIDTH;
    const height = type === "menu" ? MENU_HEIGHT : PICKER_HEIGHT;

    let left = popupAnchor.right - width;
    left = Math.max(VIEWPORT_PADDING, left);
    left = Math.min(left, viewportWidth - width - VIEWPORT_PADDING);

    let top = popupAnchor.bottom + OFFSET;
    if (top + height > viewportHeight - VIEWPORT_PADDING) {
      top = popupAnchor.top - height - OFFSET;
    }
    top = Math.max(VIEWPORT_PADDING, top);

    return { top, left };
  };

  const handleSwipeStart = (messageId, event) => {
    if (event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    swipeRef.current = {
      id: messageId,
      startX: touch.clientX,
      startY: touch.clientY,
      active: false,
    };
  };

  const handleSwipeMove = (messageId, message, event) => {
    const state = swipeRef.current;
    if (state.id !== messageId || event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;

    if (!state.active) {
      if (Math.abs(deltaX) < 8) {
        return;
      }
      if (Math.abs(deltaX) <= Math.abs(deltaY)) {
        swipeRef.current = { id: null, startX: 0, startY: 0, active: false };
        return;
      }
      swipeRef.current = { ...state, active: true };
    }

    const clamped = Math.max(0, Math.min(deltaX, SWIPE_MAX));
    if (clamped > 0) {
      event.preventDefault();
    }

    swipeOffsetRef.current = { id: messageId, offset: clamped };
    setSwipeState({ id: messageId, offset: clamped });

    if (clamped >= SWIPE_TRIGGER) {
      setOpenMenuForId(null);
      setOpenPickerForId(null);
      setPopupAnchor(null);
      setPendingDelete(null);
    }
  };

  const handleSwipeEnd = (messageId, message) => {
    const state = swipeRef.current;
    if (state.id !== messageId) {
      return;
    }

    const shouldReply =
      swipeOffsetRef.current.id === messageId &&
      swipeOffsetRef.current.offset >= SWIPE_TRIGGER;

    swipeRef.current = { id: null, startX: 0, startY: 0, active: false };
    swipeOffsetRef.current = { id: null, offset: 0 };
    setSwipeState((prev) =>
      prev.id === messageId ? { id: null, offset: 0 } : prev,
    );

    if (shouldReply) {
      onReply(message);
    }
  };

  return (
    <>
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-8 py-6 flex flex-col gap-3 max-[768px]:px-4 max-[520px]:px-3"
      >
        {messages.length === 0 && (
          <p className="text-slate-500">No messages yet. Say hello 👋</p>
        )}
        {messages.map((msg, index) => {
          const showDay =
            index === 0 ||
            formatDay(messages[index - 1].createdAt) !==
              formatDay(msg.createdAt);
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
            <div key={msg._id} className="ui-bubble-in">
              {showDay && (
                <div className="text-center text-xs text-slate-400 my-2">
                  {formatDay(msg.createdAt)}
                </div>
              )}
              <div
                className={`relative max-w-[70%] rounded-2xl p-3 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.08)] ui-ease ${
                  openMenuForId === msg._id || openPickerForId === msg._id
                    ? "z-50"
                    : "z-0"
                } ${
                  isOwn
                    ? "theme-accent-bg self-end"
                    : "bg-white/75 backdrop-blur border border-slate-200 self-start"
                } max-[768px]:max-w-[85%] max-[520px]:max-w-full`}
                style={{
                  transform:
                    swipeState.id === msg._id
                      ? `translateX(${swipeState.offset}px)`
                      : "translateX(0px)",
                  transition:
                    swipeState.id === msg._id
                      ? "none"
                      : "transform 160ms ease-out",
                }}
                onTouchStart={(event) => handleSwipeStart(msg._id, event)}
                onTouchMove={(event) => handleSwipeMove(msg._id, msg, event)}
                onTouchEnd={() => handleSwipeEnd(msg._id, msg)}
                onTouchCancel={() => handleSwipeEnd(msg._id, msg)}
              >
                {editingMessageId !== msg._id && (
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      className="rounded-full border border-slate-300/70 bg-white/70 px-2 py-0.5 text-xs"
                      onClick={(event) => openMenuAtButton(event, msg._id)}
                    >
                      ⋮
                    </button>
                  </div>
                )}
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
                {editingMessageId !== msg._id && <div className="mt-2" />}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {popupAnchor &&
        (openMenuForId || pendingDelete) &&
        createPortal(
          <div
            className="fixed inset-0 z-50 pointer-events-auto"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setOpenMenuForId(null);
                setOpenPickerForId(null);
                setPopupAnchor(null);
                setPendingDelete(null);
              }
            }}
          >
            {!pendingDelete && (
              <div
                className="absolute w-44 rounded-xl border border-slate-200 bg-white/95 backdrop-blur p-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.16)]"
                style={getPopupStyle("menu")}
              >
                {messages
                  .filter((item) => item._id === openMenuForId)
                  .map((msg) => {
                    const isOwn = msg.senderId === userId;
                    return (
                      <div key={msg._id}>
                        {isOwn && (
                          <button
                            type="button"
                            className="w-full text-left rounded-lg px-2.5 py-2 text-xs hover:bg-slate-100"
                            onClick={() => {
                              onStartEdit(msg);
                              setOpenMenuForId(null);
                              setOpenPickerForId(null);
                              setPopupAnchor(null);
                            }}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          className="w-full text-left rounded-lg px-2.5 py-2 text-xs hover:bg-slate-100"
                          onClick={() => {
                            onReply(msg);
                            setOpenMenuForId(null);
                            setOpenPickerForId(null);
                            setPopupAnchor(null);
                          }}
                        >
                          Reply
                        </button>
                        <button
                          type="button"
                          className="w-full text-left rounded-lg px-2.5 py-2 text-xs hover:bg-slate-100"
                          onClick={() => {
                            onForward(msg);
                            setOpenMenuForId(null);
                            setOpenPickerForId(null);
                            setPopupAnchor(null);
                          }}
                        >
                          Forward
                        </button>
                        <button
                          type="button"
                          className="w-full text-left rounded-lg px-2.5 py-2 text-xs hover:bg-slate-100"
                          onClick={() =>
                            setOpenPickerForId(
                              openPickerForId === msg._id ? null : msg._id,
                            )
                          }
                        >
                          React
                        </button>
                        {isOwn && (
                          <button
                            type="button"
                            className="w-full text-left rounded-lg px-2.5 py-2 text-xs hover:bg-slate-100"
                            onClick={() => {
                              setPendingDelete({
                                messageId: msg._id,
                                scope: "me",
                              });
                              setOpenMenuForId(null);
                              setOpenPickerForId(null);
                            }}
                          >
                            Delete for me
                          </button>
                        )}
                        {isOwn && (
                          <button
                            type="button"
                            className="w-full text-left rounded-lg px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50"
                            onClick={() => {
                              setPendingDelete({
                                messageId: msg._id,
                                scope: "all",
                              });
                              setOpenMenuForId(null);
                              setOpenPickerForId(null);
                            }}
                          >
                            Delete for all
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
            {pendingDelete && (
              <div className="absolute inset-0 grid place-items-center px-4">
                <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white/95 backdrop-blur p-4 shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
                  <p className="text-sm text-slate-700">
                    {pendingDelete.scope === "all"
                      ? "Are you sure you want to delete this message for everyone? This action cannot be undone."
                      : "Delete this message for you?"}
                  </p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100"
                      onClick={() => setPendingDelete(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-rose-200 bg-rose-600 px-3 py-1.5 text-xs text-white hover:bg-rose-700"
                      onClick={() => {
                        onDelete(pendingDelete.messageId, pendingDelete.scope);
                        setPendingDelete(null);
                        setOpenMenuForId(null);
                        setOpenPickerForId(null);
                        setPopupAnchor(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
            {openPickerForId && (
              <div className="absolute" style={getPopupStyle("picker")}>
                {messages
                  .filter((item) => item._id === openPickerForId)
                  .map((msg) => (
                    <EmojiPicker
                      key={msg._id}
                      onEmojiClick={(emojiData) => {
                        onReact(msg._id, emojiData.emoji);
                        setOpenPickerForId(null);
                        setOpenMenuForId(null);
                        setPopupAnchor(null);
                      }}
                      width={300}
                      height={360}
                      previewConfig={{ showPreview: false }}
                      searchDisabled={false}
                      skinTonesDisabled={true}
                    />
                  ))}
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

export default MessageList;
