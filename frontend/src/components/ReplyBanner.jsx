function ReplyBanner({ replyTo, onCancel }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-900/5 px-8 py-2.5 max-[768px]:px-4">
      <span className="text-sm text-slate-600">
        Replying to:{" "}
        {replyTo.text ||
          replyTo.fileName ||
          replyTo.stickerName ||
          "Attachment"}
      </span>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full border border-slate-200 px-3 py-1 text-xs"
      >
        Cancel
      </button>
    </div>
  );
}

export default ReplyBanner;
