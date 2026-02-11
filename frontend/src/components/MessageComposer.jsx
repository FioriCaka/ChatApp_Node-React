import { useEffect, useRef } from "react";

function MessageComposer({
  messageText,
  onMessageChange,
  onSendMessage,
  onAttachment,
  onToggleEmotes,
  onToggleStickers,
  onClosePickers,
  showEmotes,
  showStickers,
  emotes,
  stickers,
  onInsertEmote,
  onSelectSticker,
  sendDisabled,
}) {
  const pickerRef = useRef(null);

  useEffect(() => {
    if (!showEmotes && !showStickers) return;

    const handleOutside = (event) => {
      if (!pickerRef.current) return;
      if (!pickerRef.current.contains(event.target)) {
        onClosePickers();
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [showEmotes, showStickers, onClosePickers]);

  return (
    <>
      <form
        className="flex gap-3 px-8 py-4 border-t border-slate-200 bg-white max-[768px]:flex-col max-[768px]:px-4"
        onSubmit={onSendMessage}
      >
        <div className="relative flex gap-2 items-center" ref={pickerRef}>
          <label className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 cursor-pointer bg-white">
            <input
              type="file"
              accept="*/*"
              onChange={(event) => onAttachment(event.target.files[0])}
              className="hidden"
            />
            📎
          </label>
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            onClick={onToggleEmotes}
          >
            🙂
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            onClick={onToggleStickers}
          >
            🧩
          </button>
          {showEmotes && (
            <div className="absolute bottom-full left-0 mb-3 z-20 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
              {emotes.map((emote) => (
                <button
                  key={emote}
                  type="button"
                  onClick={() => onInsertEmote(emote)}
                  className="rounded-xl border border-slate-200 px-2 py-1 text-lg"
                >
                  {emote}
                </button>
              ))}
            </div>
          )}
          {showStickers && (
            <div className="absolute bottom-full left-0 mb-3 z-20 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
              {stickers.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => onSelectSticker(item)}
                  className="rounded-xl border border-slate-200 p-1"
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-14 h-14 object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          value={messageText}
          onChange={(event) => onMessageChange(event.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-base"
        />
        <button
          type="submit"
          disabled={sendDisabled}
          className="rounded-xl bg-slate-900 px-5 py-3 text-white disabled:opacity-60 max-[768px]:w-full"
        >
          Send
        </button>
      </form>
    </>
  );
}

export default MessageComposer;
